import MySQLdb, platform, MySQLdb.cursors
import os.path


def js_spy_connect():
    if os.path.isfile(".10000"):
        db = MySQLdb.connect(user="js_spy_admin",
                             passwd="rHeb6ni0",
                             host="localhost",
                             db="js_spy_db",
                             cursorclass=MySQLdb.cursors.DictCursor)
    elif os.path.isfile(".10001"):
        db = MySQLdb.connect(user="root",
                             passwd="password",
                             host="localhost",
                             db="js_spy_db",
                             cursorclass=MySQLdb.cursors.DictCursor)
    elif os.path.isfile(".10002"):
        db = MySQLdb.connect(user="root",
                             passwd="time_series",
                             host="localhost",
                             db="js_spy_db",
                             cursorclass=MySQLdb.cursors.DictCursor)
    else:
        db = MySQLdb.connect(user="js_spy_admin",
                             passwd="time_series",
                             host="mysql.jombooth.com",
                             db="js_spy_db",
                             cursorclass=MySQLdb.cursors.DictCursor)
    return db
