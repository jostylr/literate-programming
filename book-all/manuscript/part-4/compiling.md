# Compile Events

This details ways to get information out about what is going on in the
compiling of a litpro document: events, reports, evaling, .. 


#### Reporting

A key feature of any programming environment is debugging. It is my hope that
this version has some better debugging information. The key to this is the
reporting function of what is waiting around. 

The way it works is that when an event of the form `waiting for:type:...` is
emitted with data `[evt, reportname, ...]` then reporters gets a key of the
event string wthout the `waiting for:`, and when the `evt` is emitted, it is
removed. 

If it is still waiting around when all is done, then it gets reported. The
reportname is used to look up which reporter is used. Then that reporter takes
in the remaining arguments and produces a string that will be part of the
final report that gets printed out.

Some of the waiting is not done by the emitting, but rather by presence in
.when and .onces. 
