for item in `ls -d */`
do
  echo $item
  cd $item
  yarn
  cd ..
done