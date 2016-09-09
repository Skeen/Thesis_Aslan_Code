//compile with gcc reference.c -lm -lpthread -g

#define _BSD_SOURCE

#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <limits.h>
#include <inttypes.h>
#include <math.h>
#include <time.h>

pthread_mutex_t mutex, printf_mutex;
unsigned int extant_threads;

#ifdef __MACH__
#include <mach/clock.h>
#include <mach/mach.h>
#endif

int threads, fibval, samples;

// actually compute fib(n)
// can be replaced with whatever
unsigned int fib(int n) {

  if (n > 1) {
    return fib(n-1) + fib(n-2);
  }

  else if (n == 1) {
    return 1;
  }

  // ok, n must have been 0
  return 0;

}


// computes fib(n), just returning the
// time it took to do it
unsigned int timefib(int n) {
  
  long ms_before, ms_after;
  time_t s_before, s_after;
  struct timespec before, after;

 

  #ifdef __MACH__ // OS X does not have clock_gettime, use clock_get_time
  clock_serv_t cclock;
  mach_timespec_t mts;
  host_get_clock_service(mach_host_self(), CALENDAR_CLOCK, &cclock);
  clock_get_time(cclock, &mts);
  mach_port_deallocate(mach_task_self(), cclock);

  before.tv_sec = mts.tv_sec; 
  before.tv_nsec = mts.tv_nsec;

  #else
  clock_gettime(CLOCK_REALTIME, &before);
  #endif


  s_before = before.tv_sec;
  ms_before = floor(before.tv_nsec / 1.0e6);

  unsigned int blackhole = fib(n);


  #ifdef __MACH__ // OS X does not have clock_gettime, use clock_get_time
  clock_serv_t cclock_after;
  mach_timespec_t mts_after;
  
  host_get_clock_service(mach_host_self(), CALENDAR_CLOCK, &cclock_after);
  clock_get_time(cclock_after, &mts_after);
  mach_port_deallocate(mach_task_self(), cclock_after);

  after.tv_sec = mts_after.tv_sec; 
  after.tv_nsec = mts_after.tv_nsec;

  #else
  clock_gettime(CLOCK_REALTIME, &after);
  #endif



  s_after = after.tv_sec;
  ms_after = floor(after.tv_nsec / 1.0e6);

  if (ms_before > ms_after) {
    ms_after += 1000;
    s_after--;
  }

  unsigned int result = (unsigned int) (s_after - s_before);
  result *= 1000;

  return result + (unsigned int) (ms_after - ms_before);

}

void* worker_thread_fn(void* because_pthread_said_so) {
  pthread_detach(pthread_self());

  char* buf = malloc(16 * samples * sizeof(char));
  int length = 0;

  int i;

  // open serialized array
  length += sprintf(buf, "[");
  for(i = 0; i < samples - 1; i++) {
    length += sprintf(buf + length, "%d,", timefib(fibval));
  }
  // close array last iteration
  length += sprintf(buf + length, "%d]", timefib(fibval));

  pthread_mutex_lock(&mutex);
  extant_threads--;
  pthread_mutex_unlock(&mutex);

  pthread_mutex_lock(&printf_mutex);
  printf("%s\n", buf);
  pthread_mutex_unlock(&printf_mutex);

  pthread_exit(NULL);
}

int main(int argc, char** argv) {

  if (argc != 4) {
    printf("USAGE: c_attack threadcount fibval samples");
    pthread_exit(NULL);
  }
  else {
    threads = atoi(argv[1]);
    fibval = atoi(argv[2]);
    samples = atoi(argv[3]);
  }

  extant_threads = 0;

  pthread_mutex_init(&mutex, NULL);
  pthread_mutex_init(&printf_mutex, NULL);

  int i;

  pthread_t* tids = malloc(sizeof(pthread_t) * threads);

  for (i = 0; i < threads; i++) {

    pthread_mutex_lock(&mutex);
    extant_threads++;
    pthread_mutex_unlock(&mutex);

    pthread_create(&tids[i], NULL, worker_thread_fn, NULL);

  }

  pthread_mutex_lock(&mutex);

  while (extant_threads != 0) {
    pthread_mutex_unlock(&mutex);
    #ifdef __MACH__
    struct timespec tim;
    tim.tv_sec  = 0;
    tim.tv_nsec = 10000;

    nanosleep(&tim, NULL);
    #else
    usleep(10000);
    #endif
    pthread_mutex_lock(&mutex);
  }
  pthread_mutex_unlock(&mutex);

  int temp = 0;


  free(tids);
  pthread_mutex_destroy(&printf_mutex);
  pthread_mutex_destroy(&mutex);
  return 0;

}