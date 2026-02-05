import pandas as pd

# This reads your file
df = pd.read_excel('cleaned hospital dataset.ods', engine='odfpy')

# This shows you the first 5 rows to prove it works
print(df.head())

# This counts how many patients are in each department
print(df['Department'].value_counts())