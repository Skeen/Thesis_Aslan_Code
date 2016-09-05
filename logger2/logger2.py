import distutils.util as util
import os
import selenium.webdriver as driver
import subprocess
import sys
import time

import global_config
import local_config


def quit(n):
    global_config.killall()
    os._exit(n)


def fset(filename, contents):
    fd = open(filename, 'w')
    fd.write(contents)
    fd.close()


def main():
    # Kill any browser windows that are still open.
    global_config.killall()

    # Load the timestamp and index.

    if os.path.isfile('checkpoint'):
        run_info = open('checkpoint', 'r').read().split(' ')
        run_timestamp = int(run_info[0])
        previous_index = int(run_info[1]) + 1
        previous_site = run_info[2]
        print('Reloading from checkpoint with timestamp %d '
              'at previous_index %d of website %s') % (
                  run_timestamp, previous_index, previous_site)
    else:
        run_timestamp = int(time.time())
        previous_index = 0
        previous_site = global_config.SITE_ARRAY[0]
        print 'STARTING FRESH at %d' % run_timestamp

    # Discard all the sites before the one of interest.

    while len(global_config.SITE_ARRAY) > 0 and (
            global_config.SITE_ARRAY[0] != previous_site):
        global_config.SITE_ARRAY = global_config.SITE_ARRAY[1:]

    for site in global_config.SITE_ARRAY:

        our_url = '?'.join([global_config.WEBSITE, str(
            global_config.FIBFRAC), local_config.USERNAME, site.split('.')[
                0], str(run_timestamp), str(global_config.WEBWORKERS_COUNT),
                            str(global_config.SYNC_BARRIERS), 'TESTDATA'])

        for i in range(previous_index, global_config.NUM_TRIALS):
            ours = global_config.launch_driver()
            theirs = global_config.launch_driver()

            ours.get(our_url)
            theirs.get('http://www.' + site)

            # Give the website SAMPLING_TIME seconds to be sent.
            time_spent = 0
            while time_spent < global_config.SAMPLING_TIME and (
                    'Successfully' not in ours.page_source):
                time.sleep(1)
                time_spent += 1

            if 'Successfully' in ours.page_source:
                checkpoint = '%d %d %s' % (run_timestamp, i, site)
                print 'SAVED:', checkpoint
                fset('checkpoint', checkpoint)
                ours.quit()
                theirs.quit()
                global_config.killall()
            else:
                quit(1)
        # If we had a previous_index, clear it to 0 now.
        previous_index = 0


if __name__ == '__main__':
    main()
