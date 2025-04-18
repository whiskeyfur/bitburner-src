<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [bitburner](./bitburner.md) &gt; [NS](./bitburner.ns.md) &gt; [read](./bitburner.ns.read.md)

## NS.read() method

Read content of a file.

**Signature:**

```typescript
read(filename: string): string;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  filename | string | Name of the file to be read. |

**Returns:**

string

Data in the specified text file.

## Remarks

RAM cost: 0 GB

This function is used to read data from a text file (.txt, .json) or script (.js, .jsx, .ts, .tsx).

This function will return the data in the specified file. If the file does not exist, an empty string will be returned.

