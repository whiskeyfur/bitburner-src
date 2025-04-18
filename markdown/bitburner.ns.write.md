<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [bitburner](./bitburner.md) &gt; [NS](./bitburner.ns.md) &gt; [write](./bitburner.ns.write.md)

## NS.write() method

Write data to a file.

**Signature:**

```typescript
write(filename: string, data?: string, mode?: "w" | "a"): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  filename | string | Name of the file to be written to. |
|  data | string | _(Optional)_ Data to write. |
|  mode | "w" \| "a" | _(Optional)_ Defines the write mode. |

**Returns:**

void

## Remarks

RAM cost: 0 GB

This function can be used to write data to a text file (.txt, .json) or a script (.js, .jsx, .ts, .tsx).

This function will write data to that file. If the specified file does not exist, then it will be created. The third argument mode defines how the data will be written to the file. If mode is set to “w”, then the data is written in “write” mode which means that it will overwrite all existing data on the file. If mode is set to any other value then the data will be written in “append” mode which means that the data will be added at the end of the file.

