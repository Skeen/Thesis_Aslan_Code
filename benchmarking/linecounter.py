#!/usr/bin/env python

import subprocess
import time
import sys


def main():
    '''Benchmarks a process's execution by computing its avg line print time.'''

    proc = subprocess.Popen(sys.argv[1:], bufsize=0, stdout=subprocess.PIPE)
    linestamps = []
    NUM_LINES = 10
    LINE_CLEAR_CONST = 80
    while proc.poll() is None:
        line = proc.stdout.readline()
        linestamps.append(time.time())
        linestamps = linestamps[-1 * NUM_LINES:]
        sys.stdout.write(' ' * LINE_CLEAR_CONST + '\r')
        sys.stdout.write(line)
        if len(linestamps) == NUM_LINES:
            time_spent_on_last_lines = float(linestamps[NUM_LINES - 1] -
                                             linestamps[0]) / (NUM_LINES - 1)
            sys.stdout.write(
                'For the last %d lines, a line was printed every %.3fs.\r' %
                (NUM_LINES, time_spent_on_last_lines))
            sys.stdout.flush()


if __name__ == '__main__':
    main()
