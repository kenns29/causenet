import sqlite3
import numpy as np
from setup import db_dir
from pandas import DataFrame


def query_country_by_year_with_import_export_data_frame_by_item_group(item_group):
    item_group_code = item_group
    start_year = 1986
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
            country_code = int(d['FAO_CountryCode'])
            import_quantity = int(d['ImportQuantity'])
            export_quantity = int(d['ExportQuantity'])
            if (country_code, 0) not in data:
                data[country_code, 0] = np.zeros(end_year - start_year)
            if (country_code, 1) not in data:
                data[country_code, 1] = np.zeros(end_year - start_year)
            data[country_code, 0][year] = export_quantity
            data[country_code, 1][year] = import_quantity
        return data
    finally:
        conn.close()
