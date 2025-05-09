<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [bitburner](./bitburner.md) &gt; [NS](./bitburner.ns.md) &gt; [getScriptRam](./bitburner.ns.getscriptram.md)

## NS.getScriptRam() method

Get the ram cost of a script.

**Signature:**

```typescript
getScriptRam(script: string, host?: string): number;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  script | string | Filename of script. This is case-sensitive. |
|  host | string | _(Optional)_ Hostname/IP of target server the script is located on. This is optional. If it is not specified then the function will use the current server as the target server. |

**Returns:**

number

Amount of RAM (in GB) required to run the specified script on the target server, and 0 if the script does not exist.

## Remarks

RAM cost: 0.1 GB

Returns the amount of RAM required to run the specified script on the target server. Returns 0 if the script does not exist.

