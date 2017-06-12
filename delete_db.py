import os
import tempfile

databaseFileName = os.path.join(tempfile.gettempdir(), 'test.db')
if os.path.isfile(databaseFileName):
  print("REMOVING SQLLITE DATABASE AT:" + databaseFileName)
  os.remove(databaseFileName)
