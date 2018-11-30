to_replace="xxx"
replace_with=${1}
for file in *${to_replace}*.png; do
    mv "$file" "${file//${to_replace}/${replace_with}}"
done
