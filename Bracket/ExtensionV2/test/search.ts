
function levenshtein(seq1: string, seq2: string): number {
	var len1 = seq1.length
	var len2 = seq2.length
	var i, j, dist, ic, dc, rc, last, old, column
	var weighter = {
		insert: function(c: string) { return 1. },
		delete: function(c: string) { return 0.5 },
		replace: function(c: string, d: string) { return 0.3 }
	}
	if (len1 == 0 || len2 == 0) {
		dist = 0
		while (len1) dist += weighter.delete(seq1[--len1])
		while (len2) dist += weighter.insert(seq2[--len2])
		return dist
	}
	column = [0]
	for (j = 1; j <= len2; ++j) column[j] = column[j - 1] + weighter.insert(seq2[j - 1]);
	for (i = 1; i <= len1; ++i) {
		last = column[0];
		column[0] += weighter.delete(seq1[i - 1]);
		for (j = 1; j <= len2; ++j) {
			old = column[j];
			if (seq1[i - 1] == seq2[j - 1]) {
				column[j] = last;
			} else {
				ic = column[j - 1] + weighter.insert(seq2[j - 1]);
				dc = column[j] + weighter.delete(seq1[i - 1]);
				rc = last + weighter.replace(seq1[i - 1], seq2[j - 1]);
				column[j] = ic < dc ? ic : (dc < rc ? dc : rc);
			}
			last = old;
		}
	}

	dist = column[len2];
	return dist;
}

const text = `A post-secondary degree pays for itself in the long run because the salary you will earn with a degree will pay back the cost of college over your career.

Room and board is one of the most expensive additional costs for higher education.

A 529 plan is a tax-free savings plan that can be started as soon as someone is born. It's a great way to start saving early for college and since it is tax-free, there are no fees as long as it is used for educational expenses.

The FAFSA is available online or on paper, the earliest it can be submitted is October 1st each year and there may be different deadlines for state-based financial aid.

Earning a degree can be expensive but it is worth it since you can earn more money over your lifetime than if you did not have a degree.

The listed price of a university can vary depending on if it is a public or private institution, but the true costs will depend on the amount of financial aid they offer you.

Living on campus while earning your degree can help you save money on transportation.

The FAFSA does not make you eligible for early admission, but it does make you eligible for federal student aid, some grants and many scholarships.

The benefits of attending a local community college include saving on transportation costs if it is local, living at home and saving on room and board, and transferring to a four-year college and saving on tuition.

The earliest you can can submit your FAFSA is October 1st of each year not January 1st.

Living at home while enrolled in post secondary school or training can save money on room and board but it raises costs for transportation.

Federally-funded grants require the student to have financial need only.

Everyone interested in post secondary education should complete the Free Application for Federal Student Aid (FAFSA) because It allows you to be eligible for federal student aid and other scholarships and grants.`
	.split("\n")
	.filter(e => e.length > 2)

;(() => {
	let maxLen = Math.max(...text.map(t => t.length))
	for (let t = 0; t < text.length; t++)
		text[t] += " ".repeat(maxLen - text[t].length)
})()

function searchText(txt: string[], s: string) {
	const dist: [number, number][] = txt.map((e, i) => [levenshtein(e, s), i])
	dist.sort((a, b) => a[0] - b[0])
	return dist.slice(0, Math.max(3, Math.ceil(txt.length / 3))).map(d => txt[d[1]])
}

console.log(searchText(text, "federal"))
