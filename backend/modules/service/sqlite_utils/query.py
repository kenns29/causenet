import sqlite3
import numpy as np
from setup import db_dir
from pandas import DataFrame


def query_country_by_year_with_import_export_data_frame_by_item_group(item_group):
    item_group_code = item_group if isinstance(item_group, int) else query_country_name_to_code()[item_group]
    start_year = 1997
    end_year = 2014
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row

        iterator = conn.execute('''
            SELECT *
            FROM FAO_Item_Group_TradeTotal t, ALL_Countries c
            WHERE t.ItemCode = ? AND t.FAO_CountryCode = c.FAO_CountryCode AND c.Use_Flag = 1                
        ''', (item_group_code, ))

        data = DataFrame(index=range(start_year, end_year))
        data.index.name = 'year'
        for d in iterator:
            year = int(d['Year'])
            if start_year <= year < end_year:
                country_code = int(d['FAO_CountryCode'])
                import_quantity = int(d['ImportQuantity'])
                export_quantity = int(d['ExportQuantity'])
                if '({}, {})'.format(country_code, 0) not in data:
                    data['({}, {})'.format(country_code, 0)] = np.zeros(end_year - start_year)
                if '({}, {})'.format(country_code, 1) not in data:
                    data['({}, {})'.format(country_code, 1)] = np.zeros(end_year - start_year)
                data['({}, {})'.format(country_code, 0)][year] = export_quantity
                data['({}, {})'.format(country_code, 1)][year] = import_quantity
        return data
    finally:
        conn.close()


def query_country_by_year_with_import_export_item_group_data_frame():
    start_year = 1997
    end_year = 2014
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row

        iterator = conn.execute('''
                SELECT *
                FROM FAO_Item_Group_TradeTotal t, ALL_Countries c
                WHERE t.FAO_CountryCode = c.FAO_CountryCode AND c.Use_Flag = 1
                AND Year >= ? AND Year < ?                
            ''', (start_year, end_year))

        data = DataFrame(index=[i for i in range(start_year, end_year)])
        data.index.name = 'year'
        for d in iterator:
            year = int(d['Year'])
            if start_year <= year < end_year:
                country_code = int(d['FAO_CountryCode'])
                item_code = int(d['ItemCode'])
                import_quantity = int(d['ImportQuantity'])
                export_quantity = int(d['ExportQuantity'])
                if '({}, {}, {})'.format(country_code, item_code, 0) not in data:
                    data['({}, {}, {})'.format(country_code, item_code, 0)] = np.zeros(end_year - start_year)
                if '({}, {}, {})'.format(country_code, item_code, 1) not in data:
                    data['({}, {}, {})'.format(country_code, item_code, 1)] = np.zeros(end_year - start_year)
                data['({}, {}, {})'.format(country_code, item_code, 0)][year] = export_quantity
                data['({}, {}, {})'.format(country_code, item_code, 1)][year] = import_quantity
        return data
    finally:
        conn.close()


def query_political_stability_by_year_data_frame():
    start_year = 1997
    end_year = 2014
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row
        iterator = conn.execute('''
            SELECT * 
            FROM Political_Stability p, ALL_Countries c
            WHERE p.FAO_CountryCode = c.FAO_CountryCode AND c.Use_Flag = 1
        ''')

        data = DataFrame(index=range(start_year, end_year))
        data.index.name = 'year'
        for d in iterator:
            country_code = int(d['FAO_CountryCode'])
            data['({}, {}, {})'.format(country_code, -1, 0)] = np.zeros(end_year - start_year)
            for year in range(start_year, end_year):
                key = str(year) + 'Estimate'
                value = d[key] if key in d.keys() else (d[str(year - 1) + 'Estimate'] + d[str(year + 1) + 'Estimate']) / 2
                data['({}, {}, {})'.format(country_code, -1, 0)][year] = value
        return data
    finally:
        conn.close()


def query_bilateral_trade_averaged_by_country_by_item_group(item_group):
    item_group_code = item_group if isinstance(item_group, int) else query_country_name_to_code()[item_group]
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row

        iterator = conn.execute('''
            SELECT t.ExportingCountryCode, 
                   t.ImportingCountryCode, 
                   t.ItemCode, 
                   AVG(t.TradeQuantity) AS TradeQuantity
            FROM FAO_Item_Group_Bilateral_Trade t, ALL_Countries c1, ALL_Countries c2
            WHERE t.ItemCode = ? AND
                  t.ExportingCountryCode = c1.FAO_CountryCode AND
                  c1.Use_Flag = 1 AND
                  t.ImportingCountryCode = c2.FAO_CountryCode AND
                  c2.Use_Flag = 1
            GROUP BY t.ExportingCountryCode, t.ImportingCountryCode
        ''', (item_group_code, ))

        return [{
            'source': int(d['ExportingCountryCode']),
            'target': int(d['ImportingCountryCode']),
            'value': int(d['TradeQuantity'])
        } for d in iterator]
    finally:
        conn.close()


def query_countries():
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row

        iterator = conn.execute('''
            SELECT FAO_CountryCode AS country_code, ISO2_CountryCode AS country, CountryName AS long_name
            FROM ALL_Countries
            WHERE Use_Flag = 1
        ''')

        return [{
            'country_code': int(d['country_code']),
            'country': d['country'],
            'long_name': d['long_name']
        } for d in iterator]
    finally:
        conn.close()


def query_items():
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row

        iterator = conn.execute('''
            SELECT *
            FROM FAO_Item_Groups
            WHERE ItemGroupCode <= 20
        ''')

        return [{
            'item_code': d['ItemGroupCode'],
            'item': d['ItemGroupName']
        } for d in iterator]
    finally:
        conn.close()


def query_country_code_to_name():
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row

        iterator = conn.execute('''
            SELECT FAO_CountryCode AS country_code, ISO2_CountryCode AS country
            FROM ALL_Countries
            WHERE Used_Flag = 1
        ''')

        return dict((int(d['country_code']), d['country']) for d in iterator)
    finally:
        conn.close()


def query_country_name_to_code():
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row

        iterator = conn.execute('''
            SELECT FAO_CountryCode AS country_code, ISO2_CountryCode AS country
            FROM ALL_Countries
            WHERE Used_Flag = 1
        ''')

        return dict((d['country'], int(d['country_code'])) for d in iterator)
    finally:
        conn.close()


def query_item_group_code_to_name():
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row

        iterator = conn.execute('''
            SELECT *
            FROM FAO_Item_Groups
        ''')

        return dict((int(d['ItemGroupCode']), d['ItemGroupName']) for d in iterator)
    finally:
        conn.close()


def query_item_group_name_to_code():
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row

        iterator = conn.execute('''
            SELECT *
            FROM FAO_Item_Groups
        ''')

        return dict((d['ItemGroupName'], int(d['ItemGroupCode'])) for d in iterator)
    finally:
        conn.close()


def query_import_social_correlation_by_country_item():
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row

        iterator = conn.execute('''
            SELECT * 
            FROM trade_social_correlation_new tsc, ALL_Countries c
            WHERE tsc.FAO_CountryCode = c.FAO_CountryCode AND c.Use_Flag = 1
                AND tsc.TradeAttribute = 'import_quantity'
                AND tsc.Lag = 0 AND tsc.SocialAttribute = 'stability'
        ''')

        return [{
            'country': int(d['FAO_CountryCode']),
            'item': int(d['ItemGroupCode']),
            'corr': float(d['Correlation'])
        } for d in iterator]
    finally:
        conn.close()


def query_trade_social_correlation_by_country_item(trade_attribute):
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row

        iterator = conn.execute('''
            SELECT * 
            FROM trade_social_correlation_new tsc, ALL_Countries c
            WHERE tsc.FAO_CountryCode = c.FAO_CountryCode AND c.Use_Flag = 1
                AND tsc.TradeAttribute = ?
                AND tsc.Lag = 0 AND tsc.SocialAttribute = 'stability'
        ''', (trade_attribute, ))

        return [{
            'country': int(d['FAO_CountryCode']),
            'item': int(d['ItemGroupCode']),
            'corr': float(d['Correlation'])
        } for d in iterator]
    finally:
        conn.close()


def query_acled_events(country=None, year_range=None):
    try:
        conn = sqlite3.connect(db_dir)
        conn.row_factory = sqlite3.Row

        query = '''
            SELECT *
            FROM ACLED
        '''

        if country is not None or year_range is not None:
            query += 'WHERE '

        cstr = 'FAO_CountryCode = \'{}\' '.format(country) if country is not None else None
        ystr = 'year >= {} AND year < {} '.format(year_range[0], year_range[1]) if year_range is not None else None

        if cstr is not None and ystr is not None:
            query += cstr + ' AND ' + ystr
        elif cstr is not None:
            query += cstr
        elif ystr is not None:
            query += ystr

        iterator = conn.execute(query)

        return [{
            'country': int(d['FAO_CountryCode']),
            'year': int(d['year']),
            'notes': d['notes'],
            'event_type': d['event_type']
        } for d in iterator]
    finally:
        conn.close()
