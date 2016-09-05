from JsSpyDb import js_spy_connect
import MySQLdb, sys, getopt, MySQLdb.cursors, datetime, random

db = js_spy_connect()
cursor = db.cursor()

qs = "update ts_table set oldData=0 where 1"

query = db.cursor()
query.execute(qs)
db.commit()

print "All oldData flags set to 0"
