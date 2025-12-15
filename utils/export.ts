export interface ExportOptions {
  format: 'json' | 'csv' | 'html'
  filters?: {
    status?: string
    priority?: string
  }
}

export async function exportTasks(options: ExportOptions): Promise<void> {
  try {
    const params = new URLSearchParams({
      format: options.format,
      ...(options.filters?.status && { status: options.filters.status }),
      ...(options.filters?.priority && { priority: options.filters.priority })
    })

    const response = await fetch(`/api/export?${params}`)
    
    if (!response.ok) {
      throw new Error('Export failed')
    }

    // Determine filename and type
    let filename: string
    let mimeType: string
    let content: string | Blob

    if (options.format === 'csv') {
      filename = `tasks_report_${Date.now()}.csv`
      mimeType = 'text/csv;charset=utf-8;'
      content = await response.text()
    } else if (options.format === 'html') {
      filename = `tasks_report_${Date.now()}.html`
      mimeType = 'text/html;charset=utf-8;'
      content = await response.text()
    } else {
      filename = `tasks_report_${Date.now()}.json`
      mimeType = 'application/json;charset=utf-8;'
      content = await response.text()
    }

    // Create download link
    const link = document.createElement('a')
    const data = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(data)

    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export error:', error)
    throw error
  }
}
