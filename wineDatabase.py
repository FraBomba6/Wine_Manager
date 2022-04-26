import sqlite3 as sl


class WineDatabase:
    def __init__(self, db_name='vini.db'):
        self.connection = connection = sl.connect(db_name)
        self.cursor = connection.cursor()
        if self.is_empty():
            self.init_table()

    def is_empty(self):
        self.cursor.execute('''
            select name from sqlite_master where type='table' and name='vini'
        ''')
        return len(self.cursor.fetchall()) == 0

    def init_table(self):
        self.cursor.execute('''
            create table cantina(
                nome varchar not null primary key,
                stato varchar not null,
                regione varchar
            )
        ''')
        self.cursor.execute('''
            create table vini(
                nome varchar not null,
                annata year not null,
                cantina varchar not null,
                prezzo decimal(6,2) check (prezzo > 0),
                vinificazione varchar check (vinificazione in ('fermo', 'frizzante', 'spumante')),
                colore varchar check (colore in ('bianco', 'rosato', 'rosso')),
                macerato integer check (macerato in (0, 1)) default 0,
                listino integer check (listino in (0, 1)) default 1,
                foreign key (cantina) references cantina(nome),
                primary key (nome, annata, cantina)
            )
        ''')
