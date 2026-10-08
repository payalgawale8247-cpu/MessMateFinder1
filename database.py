import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        port="5432",
        database="messmatefinder",
        user="postgres",
        password="payal1722"
    )

    print("Database connected successfully!")

    conn.close()

except Exception as e:
    print("Database connection failed!")
    print(e)