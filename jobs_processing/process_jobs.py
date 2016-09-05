#!/usr/bin/env python

import os
import subprocess
import time

TEMP_JOBFILES_PATH = '/home/ogun/Repos/js_spy/jobs_processing/temp_jobfiles/'
JOBFILES_PATH = '/home/ogun/Repos/js_spy/jobs_processing/jobfiles/'
REPORTS_PATH = '/home/ogun/Repos/js_spy/jobs_processing/reports/'
KNNDTW_PATH = '/home/ogun/Repos/js_spy/knn_dtw/'

TIME_STRING = str(time.time())


def name(path):
    toks = path.split('/')
    return toks[len(toks) - 1]


def string_to_file(s, name):
    fd = open(name, 'w')
    fd.write(s)
    fd.close()


def pairs(l):
    output = []
    for i in range(len(l)):
        for j in range(i + 1, len(l)):
            output.append((l[i], l[j]))
    return output


def main():
    jobfiles = [JOBFILES_PATH + s for s in os.listdir(JOBFILES_PATH)]

    # Split all jobfiles, check against self
    # to obtain theoretical max values.
    for jobfile in jobfiles:
        fd_L_name = '%s_L' % (TEMP_JOBFILES_PATH + name(jobfile))
        fd_R_name = '%s_R' % (TEMP_JOBFILES_PATH + name(jobfile))

        fd_src = open(jobfile, 'r')
        fd_L = open(fd_L_name + TIME_STRING, 'w')
        fd_R = open(fd_R_name + TIME_STRING, 'w')

        modulo_count = 0
        for line in fd_src.readlines():
            if modulo_count % 6 in (0, 1, 2):
                fd_L.write(line)
            else:
                fd_R.write(line)
            modulo_count += 1

        fd_src.close()
        fd_L.close()
        fd_R.close()

        LR_report = subprocess.check_output(
            [KNNDTW_PATH + 'clf.run', '--use-time-domain', fd_L_name +
             TIME_STRING, fd_R_name + TIME_STRING])
        string_to_file(LR_report, REPORTS_PATH + 'report_%s_%s' %
                       (name(fd_L_name), name(fd_R_name)))

        RL_report = subprocess.check_output(
            [KNNDTW_PATH + 'clf.run', '--use-time-domain', fd_R_name +
             TIME_STRING, fd_L_name + TIME_STRING])
        string_to_file(RL_report, REPORTS_PATH + 'report_%s_%s' %
                       (name(fd_R_name), name(fd_L_name)))

        # Delete the temporary jobfiles.
        subprocess.call(['rm', fd_L_name + TIME_STRING, fd_R_name + TIME_STRING
                         ])

    # Here we check the distinct jobfiles against each other.
    for jobfile_A, jobfile_B in pairs(jobfiles):
        AB_report = subprocess.check_output(
            [KNNDTW_PATH + 'clf.run', '--use-time-domain', jobfile_A, jobfile_B
             ])
        string_to_file(AB_report, REPORTS_PATH + 'report_%s_%s' %
                       (name(jobfile_A), name(jobfile_B)))

        BA_report = subprocess.check_output(
            [KNNDTW_PATH + 'clf.run', '--use-time-domain', jobfile_B, jobfile_A
             ])
        string_to_file(BA_report, REPORTS_PATH + 'report_%s_%s' %
                       (name(jobfile_B), name(jobfile_A)))


if __name__ == '__main__':
    main()
