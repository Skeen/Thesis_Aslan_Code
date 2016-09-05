#!/usr/bin/python

from JsSpyDb import js_spy_connect
from TimeSeries import TimeSeries
import MySQLdb, sys, getopt, MySQLdb.cursors

# COL_UID, COL_userCookie, COL_timestamp, COL_userAgent, COL_timeSeries, COL_tag = 0,1,2,3,4,5


class TimeSeriesSql(TimeSeries):
    def __init__(self, tag):
        self.db_lookup_ok = False
        db = js_spy_connect()
        query = db.cursor()
        query.execute(
            "select timeSeries from ts_table \
                       where tag='" + tag +
            "' AND entry_kind = 'traindata' order by timestamp desc limit 1")
        results = query.fetchall()
        for row in results:
            super(TimeSeriesSql, self).__init__(row['timeSeries'],
                                                tag_list=tag)
            self.db_lookup_ok = True
            break  #  2015-01-15; AA; the loop is an overkill, but i leave this for now.
        query.close()
        db.close()


def main(argv):
    tss = TimeSeriesSql(argv[0])
    if tss.db_lookup_ok:
        print tss.as_1d_array()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1:])
