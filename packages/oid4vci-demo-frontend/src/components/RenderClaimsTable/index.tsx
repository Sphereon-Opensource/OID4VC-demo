import React, {useEffect, useState} from 'react'
import {Table} from 'rsuite'
import {isImageAddress} from "@sphereon/ui-components.credential-branding"
import 'rsuite/dist/rsuite.min.css'
import 'rsuite-table/dist/css/rsuite-table.css'

type ClaimsPayload = Record<string, any>


interface TableRow {
    id: string
    key?: string
    value?: any
    isImage?: boolean
    children?: TableRow[]
}

const formatKey = (key: string): string => {
    return key.replace(/([A-Z|0-9])/g, (match, p1, offset) => {
        return offset > 0 ? ` ${p1}` : p1
    })
}

const RenderClaimsTable: React.FC<{ payload: ClaimsPayload }> = ({payload}) => {
    const [tableData, setTableData] = useState<TableRow[]>([])
    const [expandedKeys, setExpandedKeys] = useState<string[]>([])

    const collectAllIds = (rows: TableRow[]): string[] => {
        const ids: string[] = []
        const collect = (nodes: TableRow[]) => {
            nodes.forEach(node => {
                ids.push(node.id)
                if (node.children) {
                    collect(node.children)
                }
            })
        }
        collect(rows)
        return ids
    }

    const processPayload = async (data: ClaimsPayload, prefix = ''): Promise<TableRow[]> => {
        const rows: TableRow[] = []

        for (const [key, value] of Object.entries(data)) {
            const id = prefix ? `${prefix}-${key}` : key
            const formattedKey = formatKey(key)

            if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
                const children = await processPayload(value, id)
                rows.push({
                    id,
                    key: formattedKey,
                    children
                })
            } else {
                const isImage = typeof value === 'string' ? await isImageAddress(value) : false
                rows.push({
                    id,
                    key: formattedKey,
                    value,
                    isImage
                })
            }
        }

        return rows
    }

    useEffect(() => {
        const loadData = async () => {
            const data = await processPayload(payload)
            setTableData(data)
            setExpandedKeys(collectAllIds(data))
        }
        loadData()
    }, [payload])

    return (
        <Table
            data={tableData}
            isTree
            rowKey="id"
            expandedRowKeys={expandedKeys}
            renderTreeToggle={() => null}
            autoHeight
            showHeader={false}
            rowHeight={(rowData) => {
                if (rowData?.isImage) {
                    return 220
                }
                if (rowData?.value && typeof rowData.value === 'string' && rowData.value.length > 100) {
                    return 100
                }
                return 50
            }}
        >
            <Table.Column flexGrow={1} treeCol>
                <Table.HeaderCell>Key</Table.HeaderCell>
                <Table.Cell>
                    {(rowData) => rowData.key || ''}
                </Table.Cell>
            </Table.Column>

            <Table.Column width={300}>
                <Table.HeaderCell>Value</Table.HeaderCell>
                <Table.Cell>
                    {(rowData) => {
                        if (rowData.isImage) {
                            return (
                                <img
                                    src={rowData.value}
                                    alt={rowData.key}
                                    style={{
                                        maxWidth: '200px',
                                        maxHeight: '200px',
                                        objectFit: 'contain'
                                    }}
                                />
                            )
                        }
                        if (rowData.value !== undefined) {
                            return (
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    overflowWrap: 'break-word'
                                }}>
                                    {String(rowData.value)}
                                </div>
                            )
                        }
                        return null
                    }}
                </Table.Cell>
            </Table.Column>
        </Table>
    )
}

export default RenderClaimsTable