all: compile

compile: c_attack.c
	$(CXX) c_attack.c -lpthread -lm -O2 -o c_attack

run:
	./c_attack 8 100 1 > output
