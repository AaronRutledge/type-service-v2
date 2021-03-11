const fs = require('fs-extra')

fs.copy('build', '../StairDesigner/bin/Debug/ui-build', err => {
  if (err) return console.error(err)

  console.log('build folder moved to add ins folder')
});
