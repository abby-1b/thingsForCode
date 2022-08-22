from math import e
from mpmath import mp, mpf
import time

# Digits
mp.dps = 1000000

# Iterations
m = 50000

f = 2
d = 1
print("Iterating...")
t = time.time()
start_time = time.time()
total_time = 0
times = []
for i in range(2, m + 1):
	if i % 5000 == 0:
		nt = time.time()
		times.append(nt - t)
		avg, predicted_time = ("_", "_")
		total_time += times[-1]
		if len(times) > 1:
			avg = times[-1] * 2 - times[-2]
			for i in range(round((m - i) / 5000)):
				predicted_time = 0
		print(f"{round((i / m) * 100)}%     Length: {len(str(f))} ~ {len(str(d))}    Time: {times[-1]}    Change: {avg}    Missing: {predicted_time}")
		t = nt
	f = f * i + 1
	d *= i

print(f"Iterated! Took {total_time}, {time.time() - start_time}")
print("Dividing...")
out = str(mpf(f) / mpf(d))
print("Divided!")
if __name__ == "__main__":
	print(out)
# print(f.t, "/", f.b)
# print(f)

# 456575
# 973352