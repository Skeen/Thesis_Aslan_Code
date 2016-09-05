import json, sys, logging

PEAK_THRESH = -1
VECLEN = 480
CLOSE_ENOUGH = 1
DEBUGMODE = True


class TimeSeries(object):
    def __init__(self, json_string_list, tag_list=None, UID=None):
        """
        if a string is passed in in place of a list of strings,
        convert to a singleton list containing that string.
        """
        if isinstance(json_string_list, str):
            json_string_list = [json_string_list]
        self.raw_list = json_string_list

        if tag_list == "":
            tag_list = None
        elif isinstance(tag_list, str):
            tag_list = [tag_list]

        if tag_list is not None and len(tag_list) > 0:
            self.tag_list = tag_list
            self.__tagged = True
        else:
            self.tag_list = []
            self.__tagged = False

        if UID is not None:
            self.UID = UID

    def is_tagged(self):
        return self.__tagged

    def get_tag(self):
        if self.is_tagged():
            return self.tag_list[0]
        else:
            raise Exception("UntaggedTimeseries")

    def __add__(self, ts_prime):
        return TimeSeries(self.raw_list + ts_prime.raw_list,
                          self.tag_list + ts_prime.tag_list)

    def stats(self):
        print "NOT YET IMPLEMENTED"

    def as_array(self, strip_stamps=True):
        """Parse the object's JSON representation and get an array corresponding to the
        JSON back out"""
        if strip_stamps:
            #structure of a raw_list:
            #  timeseries group list
            #    timeseries group
            #      timeseries
            #        timeseries element
            ts_group_list = [json.loads(s) for s in self.raw_list]
            # type of temp: list of groups of timeseries
            return [[[elt[1] for elt in ts] for ts in ts_group]
                    for ts_group in ts_group_list]
        else:
            return [json.loads(s) for s in self.raw_list]

    # Use the "comp" function to group multiple webworkers' results
    # into a single row
    def as_1d_array(self, comp=max):
        outl = []
        ts_group_array = self.as_array()
        for ts_group in ts_group_array:
            if len(ts_group) > 0:  # 2015-07-24; AA - extra check for bad entries in DB
                for i in range(0, len(ts_group[0])):
                    candidates = [ts_group[tsID][i]
                                  for tsID in range(0, len(ts_group))]
                    outl.append(comp(candidates))
        return outl

    def as_1d_array_with_abstimes(self):
        # JB - Wed Aug 19 01:22:15 EDT 2015 - max function for [ret, abs] time elements.
        def comp(xs):
            return max(xs, key=lambda x: x[1])

        outl = []
        ts_group_array = self.as_array(strip_stamps=False)
        for ts_group in ts_group_array:
            if len(ts_group) > 0:
                for i in range(0, len(ts_group[0])):
                    candidates = [ts_group[tsID][i]
                                  for tsID in range(0, len(ts_group))]
                    outl.append(comp(candidates))
        return outl

    # Transform arbitrarily many summed timeseries into a list of
    # vectors for classification and return the bounds on the first wave found
    def as_veclist_plus_bounds(self):
        single_series = self.as_1d_array()
        outl = []

        # report the start and end of first found wave
        lb, ub = -1, -1

        # setup initial state
        templ, output_mode, skip_n = [], False, VECLEN

        for i in range(0, len(single_series) - 1):
            if output_mode:
                skip_n -= 1

                templ.append(single_series[i])
                # print >> sys.stderr, skip_n

                if skip_n == 0:
                    # add templ to output_mode
                    outl.append(templ)
                    logging.debug(
                        "now writing a timeseries to the vector list")
                    # and return to initial state
                    templ, output_mode, skip_n = [], False, VECLEN

            elif single_series[i] > PEAK_THRESH and single_series[
                    i + 1] > PEAK_THRESH:
                # if no bounds are set yet, set them
                if lb == -1:
                    lb, ub = i, i + VECLEN

                if self.is_tagged() and DEBUGMODE:
                    logging.debug("Chopping wave for %s at index %s.",
                                  self.get_tag(), str(i))
                output_mode = True

        # if we exited the loop with a mostly finished vector, pad it to length with zeros

        # if len(templ) > CLOSE_ENOUGH * VECLEN and len(templ) < VECLEN:
        #     while len(templ) < VECLEN:
        #         templ.append(0)
        #     # append the length-fixed vector to the list
        #     outl.append(templ)

        if DEBUGMODE:
            pass
            # print >> sys.stderr, ""
        return (outl, (lb, ub))

    # get just the list of vectors from a timeseries, and throw out the bounds.
    def as_vector_list(self):
        return self.as_veclist_plus_bounds()[0]

    # Transform a singleton tagged timeseries group into a vector, tag, (bounds) triple
    def to_classifier_input(self):
        # TODO: figure out what the start index should be from dataset instead.
        STARTPOINT = 35
        vecl, (lb, ub) = self.as_veclist_plus_bounds()
        if self.is_tagged():
            if len(vecl) > 0:
                return (self.get_tag(), vecl[0], (lb, ub))
            else:
                print "no information in timeseries for: " + self.get_tag()
                return None
        else:
            print "This timeseries is not tagged."
            raise Exception("UntaggedTimeseries")

    def to_classifier_input_with_abstimes(self):
        vecl = self.as_1d_array_with_abstimes()
        if self.is_tagged():
            if len(vecl) > 0:
                return (self.get_tag(), vecl, (-1, -1), self.UID)
            else:
                print "no information in timeseries for: " + self.get_tag()
                return None
        else:
            print "This timeseries is not tagged."
            raise Exception("UntaggedTimeseries")


"""
METADATA SETTING FUNCTIONS
"""

# def set_rejection_closure(table_name, query):
#     def outfun(ts, boolval):
#         if boolval:
#             # this means we DID reject
#             query.execute("UPDATE " + table_name + " set wasRejected=1 WHERE UID = " + str(ts.UID))
#         else:
#             # this means we DID NOT reject
#             query.execute("UPDATE " + table_name + " set wasRejected=0 WHERE UID = " + str(ts.UID))
#     return outfun

# def set_bounds_closure(table_name, query):
#     def outfun(ts, lb, ub):
#         query.execute(("UPDATE " + table_name + " set windowStart=%s, windowEnd=%s WHERE UID = " % (str(lb), str(ub))) + str(ts.UID))
#     return outfun

# def set_prediction_closure(table_name, query):
#     def outfun(ts, prediction):
#         query.execute(("UPDATE " + table_name + " set guessedTag=\"%s\" WHERE UID = " % prediction[0]) + str(ts.UID))
#     return outfun
