import React, { useState, useEffect, useRef } from "react";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import { Paper, Popper, TextField, Typography } from "@mui/material";

import { KEY } from "../../utils/KeyboardEventKey";
import { Terminal } from "../../Terminal";
import { Player } from "@player";
import { getTabCompletionPossibilities } from "../getTabCompletionPossibilities";
import { Settings } from "../../Settings/Settings";
import { longestCommonStart } from "../../utils/StringHelperFunctions";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";

const useStyles = makeStyles()((theme: Theme) => ({
  input: {
    backgroundColor: theme.colors.backgroundprimary,
  },
  nopadding: {
    padding: theme.spacing(0),
  },
  preformatted: {
    margin: theme.spacing(0),
  },
  absolute: {
    margin: theme.spacing(0),
    position: "absolute",
    bottom: "12px",
    opacity: "0.75",
    maxWidth: "100%",
    whiteSpace: "pre",
    overflow: "hidden",
    pointerEvents: "none",
  },
}));

// Save command in case we de-load this screen.
let command = "";

export function TerminalInput(): React.ReactElement {
  const terminalInput = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(command);
  const [postUpdateValue, setPostUpdateValue] = useState<{ postUpdate: () => void } | null>();
  const [possibilities, setPossibilities] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchResultsIndex, setSearchResultsIndex] = useState(0);
  const [autofilledValue, setAutofilledValue] = useState(false);
  const { classes } = useStyles();

  // If we have no data in the current terminal history, let's initialize it from the player save
  if (Terminal.commandHistory.length === 0 && Player.terminalCommandHistory.length > 0) {
    Terminal.commandHistory = Player.terminalCommandHistory;
    Terminal.commandHistoryIndex = Terminal.commandHistory.length;
  }

  // Need to run after state updates, for example if we need to move cursor
  // *after* we modify input
  useEffect(() => {
    if (postUpdateValue?.postUpdate) {
      postUpdateValue.postUpdate();
      setPostUpdateValue(null);
    }
  }, [postUpdateValue]);

  function saveValue(newValue: string, postUpdate?: () => void): void {
    /**
     * There are reports of a crash caused by "value" (the React state) being undefined. It means that a caller of this
     * function passes undefined to the first parameter. Currently, we don't know which caller does that, so we put this
     * safety check here to mitigate the crash and gather more debug information.
     */
    if (newValue == null) {
      exceptionAlert(
        new Error(
          `saveValue was called with invalid value.\n` +
            `command: ${command}\nterminalInput.current.value: ${terminalInput.current?.value}\nvalue: ${value}\n` +
            `possibilities: ${possibilities}\nsearchResults: ${searchResults}\nsearchResultsIndex: ${searchResultsIndex}\n` +
            `Terminal.commandHistory: ${Terminal.commandHistory}\nTerminal.commandHistoryIndex: ${Terminal.commandHistoryIndex}`,
        ),
        true,
      );
      return;
    }
    command = newValue;
    setValue(newValue);

    if (postUpdate) {
      setPostUpdateValue({ postUpdate });
    }
  }

  function handleValueChange(event: React.ChangeEvent<HTMLInputElement>): void {
    saveValue(event.target.value);
    setPossibilities([]);
    setSearchResults([]);
    setAutofilledValue(false);
  }

  function resetSearch(isAutofilled = false) {
    setSearchResults([]);
    setAutofilledValue(isAutofilled);
    setSearchResultsIndex(0);
  }

  function getSearchSuggestionPrespace() {
    const currentPrefix = `[${Player.getCurrentServer().hostname} /${Terminal.cwd()}]> `;
    const prefixLength = `${currentPrefix}${value}`.length;
    return Array<string>(prefixLength).fill(" ");
  }

  function modifyInput(mod: Modification): void {
    const ref = terminalInput.current;
    if (!ref) return;
    const inputLength = value.length;
    const start = ref.selectionStart;
    if (start === null) return;
    const inputText = ref.value;

    switch (mod) {
      case "backspace":
        if (start > 0 && start <= inputLength + 1) {
          saveValue(inputText.substr(0, start - 1) + inputText.substr(start));
        }
        break;
      case "deletewordbefore": // Delete rest of word before the cursor
        for (let delStart = start - 1; delStart > -2; --delStart) {
          if ((inputText.charAt(delStart) === KEY.SPACE || delStart === -1) && delStart !== start - 1) {
            saveValue(inputText.substr(0, delStart + 1) + inputText.substr(start), () => {
              // Move cursor to correct location
              // foo bar |baz bum --> foo |baz bum
              const ref = terminalInput.current;
              ref?.setSelectionRange(delStart + 1, delStart + 1);
            });
            return;
          }
        }
        break;
      case "deletewordafter": // Delete rest of word after the cursor, including trailing space
        for (let delStart = start + 1; delStart <= value.length + 1; ++delStart) {
          if (inputText.charAt(delStart) === KEY.SPACE || delStart === value.length + 1) {
            saveValue(inputText.substr(0, start) + inputText.substr(delStart + 1), () => {
              // Move cursor to correct location
              // foo bar |baz bum --> foo bar |bum
              const ref = terminalInput.current;
              ref?.setSelectionRange(start, start);
            });
            return;
          }
        }
        break;
      case "clearafter": // Deletes everything after cursor
        saveValue(inputText.substr(0, start));
        break;
      case "clearbefore": // Deletes everything before cursor
        saveValue(inputText.substr(start), () => moveTextCursor("home"));
        break;
      case "clearall": // Deletes everything in the input
        saveValue("");
        resetSearch();
        break;
    }
  }

  function moveTextCursor(loc: Location): void {
    const ref = terminalInput.current;
    if (!ref) return;
    const inputLength = value.length;
    const start = ref.selectionStart;
    if (start === null) return;

    switch (loc) {
      case "home":
        ref.setSelectionRange(0, 0);
        break;
      case "end":
        ref.setSelectionRange(inputLength, inputLength);
        break;
      case "prevchar":
        if (start > 0) {
          ref.setSelectionRange(start - 1, start - 1);
        }
        break;
      case "prevword":
        for (let i = start - 2; i >= 0; --i) {
          if (ref.value.charAt(i) === KEY.SPACE) {
            ref.setSelectionRange(i + 1, i + 1);
            return;
          }
        }
        ref.setSelectionRange(0, 0);
        break;
      case "nextchar":
        ref.setSelectionRange(start + 1, start + 1);
        break;
      case "nextword":
        for (let i = start + 1; i <= inputLength; ++i) {
          if (ref.value.charAt(i) === KEY.SPACE) {
            ref.setSelectionRange(i, i);
            return;
          }
        }
        ref.setSelectionRange(inputLength, inputLength);
        break;
      default:
        console.warn("Invalid loc argument in Terminal.moveTextCursor()");
        break;
    }
  }

  // Catch all key inputs and redirect them to the terminal.
  useEffect(() => {
    function keyDown(this: Document, event: KeyboardEvent): void {
      if (Terminal.contractOpen) return;
      if (Terminal.action !== null && event.key === KEY.C && event.ctrlKey) {
        Terminal.finishAction(true);
        return;
      }
      const ref = terminalInput.current;
      if (event.ctrlKey || event.metaKey) return;
      if (event.key === KEY.C && (event.ctrlKey || event.metaKey)) return; // trying to copy

      if (ref) ref.focus();
    }
    document.addEventListener("keydown", keyDown);
    return () => document.removeEventListener("keydown", keyDown);
  });

  async function onKeyDown(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): Promise<void> {
    const ref = terminalInput.current;

    // Run command or insert newline
    if (event.key === KEY.ENTER) {
      event.preventDefault();
      const command = searchResults.length ? searchResults[searchResultsIndex] : value;
      Terminal.print(`[${Player.getCurrentServer().hostname} /${Terminal.cwd()}]> ${command}`);
      if (command) {
        Terminal.executeCommands(command);
        saveValue("");
        resetSearch();
      }
      return;
    }

    // Autocomplete
    if (event.key === KEY.TAB) {
      if (event.altKey || event.ctrlKey) {
        return;
      }
      event.preventDefault();
      if (searchResults.length) {
        saveValue(searchResults[searchResultsIndex]);
        resetSearch(true);
        return;
      }
      const possibilities = await getTabCompletionPossibilities(value, Terminal.cwd());
      if (possibilities.length === 0) return;

      setSearchResults([]);
      if (possibilities.length === 1) {
        saveValue(value.replace(/[^ ]*$/, possibilities[0]) + " ");
        return;
      }
      // More than one possibility, check to see if there is a longer common string than currentText.
      const longestMatch = longestCommonStart(possibilities);
      saveValue(value.replace(/[^ ]*$/, longestMatch));
      setPossibilities(possibilities);
    }

    // Clear screen.
    if (event.key === KEY.L && event.ctrlKey) {
      event.preventDefault();
      Terminal.clear();
    }

    // Select previous command.
    if (event.key === KEY.UP_ARROW || (Settings.EnableBashHotkeys && event.key === KEY.P && event.ctrlKey)) {
      if (Settings.EnableBashHotkeys || (Settings.EnableHistorySearch && value)) {
        event.preventDefault();
      }
      const i = Terminal.commandHistoryIndex;
      const len = Terminal.commandHistory.length;

      if (len == 0) {
        return;
      }

      // If there is a partial command in the terminal, hitting "up" will filter the history
      if (value && !autofilledValue && Settings.EnableHistorySearch) {
        if (searchResults.length > 0) {
          setSearchResultsIndex((searchResultsIndex + 1) % searchResults.length);
          return;
        }
        const newResults = [...new Set(Terminal.commandHistory.filter((item) => item?.startsWith(value)).reverse())];

        if (newResults.length) {
          setSearchResults(newResults);
        }
        // Prevent moving through the history when the user has a search term even if there are
        // no search results, to be consistent with zsh-type terminal behavior
        return;
      }

      if (i < 0 || i > len) {
        Terminal.commandHistoryIndex = len;
      }

      if (i != 0) {
        --Terminal.commandHistoryIndex;
      }
      const prevCommand = Terminal.commandHistory[Terminal.commandHistoryIndex];
      saveValue(prevCommand);
      resetSearch(true);
      if (ref) {
        setTimeout(function () {
          ref.selectionStart = ref.selectionEnd = 10000;
        }, 10);
      }
    }

    // Select next command
    if (event.key === KEY.DOWN_ARROW || (Settings.EnableBashHotkeys && event.key === KEY.M && event.ctrlKey)) {
      if (Settings.EnableBashHotkeys) {
        event.preventDefault();
      }
      if (searchResults.length > 0) {
        setSearchResultsIndex(searchResultsIndex === 0 ? searchResults.length - 1 : searchResultsIndex - 1);
        return;
      }

      const i = Terminal.commandHistoryIndex;
      const len = Terminal.commandHistory.length;

      if (len == 0) {
        return;
      }
      if (i < 0 || i > len) {
        Terminal.commandHistoryIndex = len;
      }

      // Latest command, put nothing
      if (i == len || i == len - 1) {
        Terminal.commandHistoryIndex = len;
        saveValue("");
        resetSearch();
      } else {
        ++Terminal.commandHistoryIndex;
        const prevCommand = Terminal.commandHistory[Terminal.commandHistoryIndex];

        saveValue(prevCommand);
        resetSearch(true);
      }
    }

    if (event.key === KEY.ESC && searchResults.length) {
      resetSearch();
    }

    // Extra Bash Emulation Hotkeys, must be enabled through options
    if (Settings.EnableBashHotkeys) {
      if (event.key === KEY.C && event.ctrlKey && ref && ref.selectionStart === ref.selectionEnd) {
        event.preventDefault();
        Terminal.print(`[${Player.getCurrentServer().hostname} /${Terminal.cwd()}]> ${value}`);
        modifyInput("clearall");
      }

      if (event.key === KEY.A && event.ctrlKey) {
        event.preventDefault();
        moveTextCursor("home");
      }

      if (event.key === KEY.E && event.ctrlKey) {
        event.preventDefault();
        moveTextCursor("end");
      }

      if (event.key === KEY.B && event.ctrlKey) {
        event.preventDefault();
        moveTextCursor("prevchar");
      }

      if (event.key === KEY.B && event.altKey) {
        event.preventDefault();
        moveTextCursor("prevword");
      }

      if (event.key === KEY.F && event.ctrlKey) {
        event.preventDefault();
        moveTextCursor("nextchar");
      }

      if (event.key === KEY.F && event.altKey) {
        event.preventDefault();
        moveTextCursor("nextword");
      }

      if ((event.key === KEY.H || event.key === KEY.D) && event.ctrlKey) {
        modifyInput("backspace");
        event.preventDefault();
      }

      if (event.key === KEY.W && event.ctrlKey) {
        event.preventDefault();
        modifyInput("deletewordbefore");
      }

      if (event.key === KEY.D && event.altKey) {
        event.preventDefault();
        modifyInput("deletewordafter");
      }

      if (event.key === KEY.U && event.ctrlKey) {
        event.preventDefault();
        modifyInput("clearbefore");
      }

      if (event.key === KEY.K && event.ctrlKey) {
        event.preventDefault();
        modifyInput("clearafter");
      }
    }
  }

  return (
    <>
      <TextField
        fullWidth
        color={Terminal.action === null ? "primary" : "secondary"}
        autoFocus
        disabled={Terminal.action !== null}
        autoComplete="off"
        value={value}
        classes={{ root: classes.preformatted }}
        onChange={handleValueChange}
        inputRef={terminalInput}
        InputProps={{
          // for players to hook in
          id: "terminal-input",
          className: classes.input,
          startAdornment: (
            <Typography color={Terminal.action === null ? "primary" : "secondary"} flexShrink={0}>
              [{Player.getCurrentServer().hostname}&nbsp;/{Terminal.cwd()}]&gt;&nbsp;
            </Typography>
          ),
          spellCheck: false,
          onBlur: () => {
            setPossibilities([]);
            resetSearch();
          },
          onKeyDown: (event) => {
            onKeyDown(event).catch((error) => {
              console.error(error);
            });
          },
        }}
      ></TextField>
      <Popper
        open={possibilities.length > 0}
        anchorEl={terminalInput.current}
        placement={"top"}
        sx={{ maxWidth: "75%" }}
      >
        <Paper sx={{ m: 1, p: 2 }}>
          <Typography classes={{ root: classes.preformatted }} color={"primary"} paragraph={false}>
            Possible autocomplete candidates:
          </Typography>
          <Typography classes={{ root: classes.preformatted }} color={"primary"} paragraph={false}>
            {possibilities.join(" ")}
          </Typography>
        </Paper>
      </Popper>
      <Typography classes={{ root: classes.absolute }} color={"primary"} paragraph={false}>
        {getSearchSuggestionPrespace()}
        {(searchResults[searchResultsIndex] ?? "").substring(value.length)}
      </Typography>
    </>
  );
}

type Modification =
  | "clearall"
  | "home"
  | "end"
  | "prevchar"
  | "prevword"
  | "nextword"
  | "backspace"
  | "deletewordbefore"
  | "deletewordafter"
  | "clearbefore"
  | "clearafter";

type Location = "home" | "end" | "prevchar" | "nextchar" | "prevword" | "nextword";
