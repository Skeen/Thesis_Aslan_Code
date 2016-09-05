# JB - Wed Aug 19 01:57:20 EDT 2015
# Simple test script to experiment with new timeseries functions
# and verify that old ones aren't broken.

import TimeSeries

ts_raw = open("test_ts", "r").read()
my_TimeSeries = TimeSeries.TimeSeries(ts_raw, tag_list="TEST")

assert([x[1] for x in my_TimeSeries.as_1d_array_with_abstimes()] == \
       my_TimeSeries.as_1d_array())

print "\n\n ASSERT OK. LENGTH %d\n\n" % len(my_TimeSeries.as_1d_array())

opt = str(my_TimeSeries.to_classifier_input_with_abstimes())
print opt[:250], "\n\n    ...    \n\n", opt[-250:]
