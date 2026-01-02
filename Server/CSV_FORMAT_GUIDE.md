# Physiological CSV Data Format Guide

## Requirements

Your CSV file must meet these requirements for successful processing:

### 1. Minimum Data Length
- **Minimum rows:** 1000 rows (10 seconds × 100 Hz sampling rate)
- **Recommended:** At least 2000-3000 rows for better accuracy
- **Time span:** Each row represents one sample at 100 Hz (0.01 seconds per row)

### 2. Required Columns

Your CSV file must have **at least one** of these columns:
- `ECG` - Electrocardiogram signal
- `EDA` - Electrodermal activity
- `EMG` - Electromyography
- `Temp` - Temperature

**Note:** If a column is missing, it will be filled with zeros. Having all columns is recommended for best results.

### 3. Data Format

```csv
ECG,EDA,EMG,Temp
0.5,0.3,0.2,36.5
0.52,0.31,0.21,36.6
0.51,0.32,0.22,36.5
...
```

### 4. Example CSV Structure

```csv
ECG,EDA,EMG,Temp
0.549671,0.369968,0.179745,35.546096
0.486174,0.346232,0.195664,36.069807
0.564769,0.302982,0.176227,36.293197
...
```

### 5. Processing Details

- **Window size:** 10 seconds = 1000 samples (rows)
- **Stride:** 5 seconds = 500 samples (rows)
- **Sampling frequency:** 100 Hz (100 samples per second)

## Common Errors and Solutions

### Error: "Insufficient data: CSV file has X rows, but needs at least 1000 rows"

**Solution:** Your CSV file is too short. You need at least 1000 rows of data.

- **For 10 seconds of data:** Minimum 1000 rows
- **For 30 seconds of data:** 3000 rows
- **For 1 minute of data:** 6000 rows

### Error: "No features extracted from data"

**Possible causes:**
1. CSV file has less than 1000 rows
2. CSV file is empty
3. CSV file has incorrect column names
4. CSV file cannot be parsed

**Solutions:**
- Check that your CSV has at least 1000 rows
- Ensure column names match: `ECG`, `EDA`, `EMG`, `Temp` (case-sensitive)
- Verify the CSV file is properly formatted (commas as separators)
- Check that the file isn't corrupted

### Error: "Missing sensors"

**Solution:** Your CSV is missing required sensor columns. The system will still work by filling missing columns with zeros, but results may be less accurate.

## Sample File

A sample CSV file (`sample_physiological_data.csv`) with 1000 rows is provided in the Server directory for testing.

## Generating Test Data

If you need to generate test data, you can use Python:

```python
import pandas as pd
import numpy as np

# Generate 1000 rows of sample data
n_samples = 1000  # Minimum required
np.random.seed(42)

data = {
    'ECG': np.random.randn(n_samples) * 0.1 + 0.5,
    'EDA': np.random.randn(n_samples) * 0.05 + 0.3,
    'EMG': np.random.randn(n_samples) * 0.03 + 0.2,
    'Temp': np.random.randn(n_samples) * 0.5 + 36.5
}

df = pd.DataFrame(data)
df.to_csv('physiological_data.csv', index=False)
```

## Tips

1. **More data = Better results:** While 1000 rows is the minimum, longer data sequences (3000+ rows) provide better stress detection accuracy.

2. **Column order doesn't matter:** As long as the column names match exactly (`ECG`, `EDA`, `EMG`, `Temp`), the order doesn't matter.

3. **Missing columns:** If you don't have all sensor data, you can still upload a CSV with only the sensors you have. Missing sensors will be set to zero.

4. **Data quality:** Ensure your data is clean and doesn't contain:
   - NaN values
   - Non-numeric values
   - Excessive outliers (unless they represent real physiological events)


