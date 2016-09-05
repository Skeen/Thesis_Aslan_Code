from JsSpyDb import js_spy_connect
import MySQLdb, sys, getopt, MySQLdb.cursors, datetime, random

db = js_spy_connect()
cursor = db.cursor()

N = int(sys.argv[1])

qs = "select groundTruthTag from ts_table where oldData=0"

query = db.cursor()
query.execute(qs)

tags = list(set([d['groundTruthTag'] for d in query.fetchall()]))

tags_to_extract = [tags[i]
                   for i in random.sample(
                       range(len(tags)), min(
                           len(tags), N))]

# yes, I know this is pretty awful.
for tag in tags_to_extract:
    query.execute("update ts_table set oldData=1 where groundTruthTag='%s'" %
                  tag)
    db.commit()

print "%d new records excluded from the dataset." % len(tags_to_extract)
print "Records classified next trial:", list(set(tags) - set(tags_to_extract))
