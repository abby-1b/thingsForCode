
# Build typescript
tsc

# Add loader (https://github.com/MaxMotovilov/eeMD) and startup string
(cat almond.js ; echo ; echo "const github_repo = \"githublinkgoeshere\"" ; echo ; cat out.js ; echo "require(['startup']);") > other.js
mv other.js out.js
sed -i -E "s/import\\.meta\\.url/github_repo/" out.js
# echo "${$out_file/import.meta.url/ai_import_meta_url}" > out.js
