#!/usr/bin/python

from JsSpyDb import js_spy_connect
from TimeSeries import TimeSeries
import MySQLdb, sys, getopt, MySQLdb.cursors, json, datetime


class TimeSeriesSqlMany(object):
    def __init__(self, tag, limit="1"):
        self.db_lookup_ok = False
        db = js_spy_connect()
        query = db.cursor()
        query.execute(
            "select timeSeries, oldData,  UID, timestamp, entry_kind from ts_table \
                       where groundTruthTag='" + tag +
            "' and oldData = 0 and entry_kind = 'traindata' order by timestamp desc limit "
            + limit)
        results = query.fetchall()
        self.ts_data = []
        if len(results) > 0:
            self.db_lookup_ok = True
            # optimize to do this just once; 2015-01-18; AA
            # DONE 2015-02-03; JB

        for row in results:
            row["timestamp"] = str(row["timestamp"])
            row["timeSeries"] = TimeSeries.as_1d_array(
                TimeSeries(row['timeSeries'],
                           tag_list=tag))
            self.ts_data.append(row)

        query.close()
        db.close()

    # def as_1d_array(self): # 2015-01-18; AA; lifts the corresponding function from the underlying class
    #     res = map (TimeSeries.as_1d_array, self.ts_data) # 2015-01-18; AA; Is this kosher at all?
    #     return res

    def as_json_dict(self):
        return json.dumps(self.ts_data)


def main(argv):
    if len(argv) > 1:
        if argv[1].isdigit():
            limit = argv[1]
        else:
            limit = "1"
    else:
        limit = "1"
    ts_data = TimeSeriesSqlMany(argv[0], limit)

    if ts_data.db_lookup_ok:
        print ts_data.as_json_dict()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1:])
