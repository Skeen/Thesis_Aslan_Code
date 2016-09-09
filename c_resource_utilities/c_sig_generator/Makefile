all: compile

compile: reference.c
	$(CXX) reference.c -lpthread -lm -O2 -o reference

run:
	./reference 8 100 1
