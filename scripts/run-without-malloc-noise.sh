#!/usr/bin/env sh
# macOS: If MallocStackLogging (or related) is set in the parent environment, every
# Node worker prints "can't turn off malloc stack logging..." and can flood stderr.
# Next/Turbopack spawns many processes, so this becomes unusable. Strip those vars here.
unset MallocStackLogging 2>/dev/null
unset MallocStackLoggingNoCompact 2>/dev/null
unset MallocScribble 2>/dev/null
unset MallocGuardEdges 2>/dev/null
unset MallocErrorAbort 2>/dev/null
unset NSZombieEnabled 2>/dev/null
unset DYLD_INSERT_LIBRARIES 2>/dev/null
unset DYLD_FORCE_FLAT_NAMESPACE 2>/dev/null

exec "$@"
