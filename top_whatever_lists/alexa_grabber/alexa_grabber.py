from selenium import webdriver
from subprocess import call
from pylab import *
import time, psutil, os, subprocess, re
from sys import exit

def trial(i):
	retlist = []


	driver = webdriver.Chrome()

	time.sleep(2)

	driver.set_page_load_timeout(60)
	try:
		driver.get("http://www.alexa.com/topsites/global;" + str(i))
	except:
		driver.quit()
		#os._exit(1)
		return

	while "/siteinfo/" not in driver.page_source:
	  time.sleep(1)
	time.sleep(1) #just to be safe; ensure page is fully loaded

	data = driver.page_source.split("<a href=\"/siteinfo/")
	driver.quit()

	for datum in data:
		retlist.append(datum[:datum.index('"')])

	return retlist

output = []

for i in range(0,20):
	output += trial(i)

fout = open("alexatop500","w")
fout.write(str(output))
#os._exit(0)

  


