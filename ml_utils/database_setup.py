import sqlite3


def create_database():
    conn = sqlite3.connect('mydatabase.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT,
            email TEXT
        )
    ''')

    conn.commit()
    conn.close()


if __name__ == '__main__':
    create_database()