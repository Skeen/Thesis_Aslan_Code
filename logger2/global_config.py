import selenium.webdriver as driver
import subprocess

# Include target websites in this file.

SITE_ARRAY = [
    'harvard.edu', 'mit.edu', 'cornell.edu', 'yale.edu', 'princeton.edu',
    'columbia.edu', 'stanford.edu', 'uchicago.edu', 'duke.edu', 'upenn.edu',
    'caltech.edu', 'jhu.edu', 'dartmouth.edu', 'brown.edu', 'northwestern.edu',
    'vanderbilt.edu', 'wustl.edu', 'rice.edu', 'nd.edu', 'berkeley.edu',
    'emory.edu', 'georgetown.edu', 'cmu.edu', 'ucla.edu', 'usc.edu',
    'virginia.edu', 'tufts.edu', 'wfu.edu', 'umich.edu', 'bc.edu', 'unc.edu',
    'nyu.edu', 'rochester.edu', 'brandeis.edu', 'wm.edu', 'gatech.edu',
    'case.edu', 'ucsb.edu', 'uci.edu', 'ucsd.edu', 'bu.edu', 'rpi.edu',
    'tulane.edu', 'ucdavis.edu', 'illinois.edu', 'wisc.edu', 'lehigh.edu',
    'northeastern.edu', 'psu.edu', 'ufl.edu', 'miami.edu', 'osu.edu',
    'pepperdine.edu', 'utexas.edu', 'washington.edu', 'yu.edu', 'gwu.edu',
    'uconn.edu', 'umd.edu', 'wpi.edu', 'clemson.edu', 'purdue.edu', 'smu.edu',
    'syr.edu', 'uga.edu', 'byu.edu', 'fordham.edu', 'pitt.edu', 'umn.edu',
    'tamu.edu', 'vt.edu', 'american.edu', 'baylor.edu', 'rutgers.edu',
    'clarku.edu', 'mines.edu', 'indiana.edu', 'msu.edu', 'stevens.edu',
    'udel.edu', 'umass.edu', 'miamioh.edu', 'tcu.edu', 'ucsc.edu', 'uiowa.edu',
    'marquette.edu', 'du.edu', 'utulsa.edu', 'binghamton.edu', 'ncsu.edu',
    'stonybrook.edu', 'esf.edu', 'colorado.edu', 'uvm.edu', 'fsu.edu',
    'slu.edu', 'ua.edu', 'drexel.edu', 'luc.edu', 'buffalo.edu', 'auburn.edu',
    'missouri.edu', 'unl.edu', 'unh.edu', 'uoregon.edu', 'utk.edu'
]

# Include the website hosting the database here

WEBSITE = 'https://jsspy.askarov.net:3000/client/'

# Include the number of webworkers to be used here.

WEBWORKERS_COUNT = 8

# Include the number of synchronization events here.

SYNC_BARRIERS = 30

# Include the number of times a website should be visited here.

NUM_TRIALS = 10

# Include the fibonacci complexity constant here.

FIBFRAC = 0.2

# Include the page load timeout here.

PAGE_LOAD_TIMEOUT = 120

# Include the sampling time here.

SAMPLING_TIME = 180

# Dev null.

dev_null = open('os.devnull', 'w')
""" **********************************************

Uncomment the functions that fit your environment.

********************************************** """


# Windows and Chrome
def launch_driver():
    ret = driver.Chrome()
    ret.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    return ret


def killall():
    subprocess.call(
        ['taskkill', '/F', '/IM', 'chrome.exe', '/T'],
        stdout=dev_null,
        stderr=subprocess.STDOUT)

# # Linux and Chrome
# def launch_driver():
#     ret = driver.Chrome()
#     ret.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
#     return ret
# 
# def killall():
#     subprocess.call(['killall', 'chrome'],
#         stdout=dev_null, stderr=subprocess.STDOUT)

# # Windows and Chrome-incognito
# def launch_driver():
#     options = driver.ChromeOptions()
#     options.add_argument('--incognito')
#     ret = driver.Chrome(chrome_options=options)
#     ret.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
#     return ret
#
# def killall():
#     subprocess.call(['taskkill', '/F', '/IM', 'chrome.exe', '/T'],
#         stdout=dev_null, stderr=subprocess.STDOUT)

# # Linux and Chrome-incognito
# def launch_driver():
#     options = driver.ChromeOptions()
#     options.add_argument('--incognito')
#     ret = driver.Chrome(chrome_options=options)
#     ret.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
#     return ret
#
# def killall():
#     subprocess.call(['killall', 'chrome'],
#         stdout=dev_null, stderr=subprocess.STDOUT)

# # Windows and Firefox
#
# def launch_driver(options=None):
#     ret = driver.Firefox()
#     ret.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
#     return ret
#
# def killall():
#     subprocess.call(['taskkill', '/F', '/IM', 'firefox.exe', '/T'],
#         stdout=dev_null, stderr=subprocess.STDOUT)
