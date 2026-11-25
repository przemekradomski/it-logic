import pymysql

# Django checks the MySQLdb-compatible API version, not the PyMySQL package version.
pymysql.version_info = (2, 2, 1, "final", 0)
pymysql.install_as_MySQLdb()