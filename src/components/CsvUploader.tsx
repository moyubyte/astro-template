import React, { useState } from 'react';
import Papa from 'papaparse';

const CsvUploader: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError('');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                if (results.meta.fields) {
                    setHeaders(results.meta.fields);
                }
                setData(results.data);
            },
            error: (err: any) => {
                console.error('Error parsing CSV:', err);
                setError('Error parsing CSV file: ' + err.message);
            }
        });
    };

    const styles = {
        container: {
            padding: '20px',
            maxWidth: '100%',
            margin: '0 auto',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        uploadBox: {
            marginBottom: '24px',
            padding: '32px',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            textAlign: 'center' as const,
            backgroundColor: '#f9f9f9',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        uploadLabel: {
            display: 'block',
            width: '100%',
            height: '100%',
            cursor: 'pointer'
        },
        uploadText: {
            fontSize: '18px',
            fontWeight: 500,
            color: '#4b5563'
        },
        fileName: {
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '8px',
            display: 'block'
        },
        hiddenInput: {
            display: 'none'
        },
        tableContainer: {
            overflowX: 'auto' as const,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
        },
        table: {
            minWidth: '100%',
            borderCollapse: 'collapse' as const,
            fontSize: '14px',
            textAlign: 'left' as const
        },
        th: {
            backgroundColor: '#f3f4f6',
            color: '#374151',
            fontWeight: 600,
            padding: '12px 24px',
            textTransform: 'uppercase' as const,
            fontSize: '12px',
            borderBottom: '1px solid #e5e7eb'
        },
        td: {
            padding: '16px 24px',
            borderBottom: '1px solid #e5e7eb',
            maxWidth: '300px',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: '#4b5563'
        },
        error: {
            color: '#ef4444',
            marginTop: '10px',
            textAlign: 'center' as const
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.uploadBox}>
                <label htmlFor="csv-upload" style={styles.uploadLabel}>
                    <span style={styles.uploadText}>Click to upload CSV</span>
                    {fileName && <span style={styles.fileName}>{fileName}</span>}
                    <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        style={styles.hiddenInput}
                    />
                </label>
                {error && <div style={styles.error}>{error}</div>}
            </div>

            {data.length > 0 && (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                {headers.map((header) => (
                                    <th key={header} style={styles.th}>
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                    {headers.map((header) => (
                                        <td key={`${index}-${header}`} style={styles.td} title={row[header]}>
                                            {row[header]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CsvUploader;
