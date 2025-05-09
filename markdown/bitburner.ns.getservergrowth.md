<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [bitburner](./bitburner.md) &gt; [NS](./bitburner.ns.md) &gt; [getServerGrowth](./bitburner.ns.getservergrowth.md)

## NS.getServerGrowth() method

Get a server growth parameter.

**Signature:**

```typescript
getServerGrowth(host: string): number;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  host | string | Hostname/IP of target server. |

**Returns:**

number

Parameter that affects the percentage by which the server’s money is increased when using the grow function.

## Remarks

RAM cost: 0.1 GB

Returns the server’s intrinsic “growth parameter”. This growth parameter is a number typically between 0 and 100 that represents how quickly the server’s money grows. This parameter affects the percentage by which the server’s money is increased when using the grow function. A higher growth parameter will result in a higher percentage increase from grow.

