import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AnalyticsResponse, LeadsOverviewData, DealPipelineData, RevenueData, SalesPerformanceData } from '@/types/analytics';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: Record<string, unknown>) => jsPDF;
        lastAutoTable: { finalY: number };
    }
}

export function exportToPDF(analytics: AnalyticsResponse, dateRange?: { start?: string; end?: string }) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo color
    doc.text('CRM Analytics Report', pageWidth / 2, 20, { align: 'center' });

    // Date range
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateText = dateRange?.start && dateRange?.end
        ? `${dateRange.start} to ${dateRange.end}`
        : `Generated on ${new Date().toLocaleDateString()}`;
    doc.text(dateText, pageWidth / 2, 28, { align: 'center' });

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary', 14, 45);

    doc.autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
            ['Total Leads', analytics.summary.total_leads.toString()],
            ['Total Customers', analytics.summary.total_customers.toString()],
            ['Total Deals', analytics.summary.total_deals.toString()],
            ['Total Revenue', `$${analytics.summary.total_revenue.toLocaleString()}`],
            ['Conversion Rate', `${analytics.summary.conversion_rate.toFixed(1)}%`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
    });

    // Leads Overview Section
    let yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Leads Overview', 14, yPos);

    if (analytics.leads_overview.length > 0) {
        doc.autoTable({
            startY: yPos + 5,
            head: [['Period', 'New', 'Contacted', 'Qualified', 'Lost']],
            body: analytics.leads_overview.map((row: LeadsOverviewData) => [
                row.date,
                row.new.toString(),
                row.contacted.toString(),
                row.qualified.toString(),
                row.lost.toString(),
            ]),
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] },
        });
    }

    // Deal Pipeline Section
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Deal Pipeline', 14, yPos);

    if (analytics.deal_pipeline.length > 0) {
        doc.autoTable({
            startY: yPos + 5,
            head: [['Stage', 'Count', 'Value']],
            body: analytics.deal_pipeline.map((row: DealPipelineData) => [
                row.stage,
                row.count.toString(),
                `$${row.value.toLocaleString()}`,
            ]),
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] },
        });
    }

    // Sales Performance Section
    yPos = doc.lastAutoTable.finalY + 15;

    // Check if we need a new page
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('Sales Performance', 14, yPos);

    if (analytics.sales_performance.length > 0) {
        doc.autoTable({
            startY: yPos + 5,
            head: [['Sales Rep', 'Deals Won', 'Revenue', 'Conversion Rate']],
            body: analytics.sales_performance.map((row: SalesPerformanceData) => [
                row.name,
                row.deals_won.toString(),
                `$${row.revenue.toLocaleString()}`,
                `${row.conversion_rate.toFixed(1)}%`,
            ]),
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] },
        });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount} | CRM-CYNERZA`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Save
    doc.save(`crm-report-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportToCSV(analytics: AnalyticsResponse) {
    const rows: string[][] = [];

    // Summary
    rows.push(['CRM Analytics Report']);
    rows.push(['Generated', new Date().toLocaleString()]);
    rows.push([]);
    rows.push(['SUMMARY']);
    rows.push(['Metric', 'Value']);
    rows.push(['Total Leads', analytics.summary.total_leads.toString()]);
    rows.push(['Total Customers', analytics.summary.total_customers.toString()]);
    rows.push(['Total Deals', analytics.summary.total_deals.toString()]);
    rows.push(['Total Revenue', analytics.summary.total_revenue.toString()]);
    rows.push(['Conversion Rate', `${analytics.summary.conversion_rate.toFixed(1)}%`]);
    rows.push([]);

    // Leads Overview
    rows.push(['LEADS OVERVIEW']);
    rows.push(['Date', 'New', 'Contacted', 'Qualified', 'Lost']);
    analytics.leads_overview.forEach((row: LeadsOverviewData) => {
        rows.push([row.date, row.new.toString(), row.contacted.toString(), row.qualified.toString(), row.lost.toString()]);
    });
    rows.push([]);

    // Deal Pipeline
    rows.push(['DEAL PIPELINE']);
    rows.push(['Stage', 'Count', 'Value']);
    analytics.deal_pipeline.forEach((row: DealPipelineData) => {
        rows.push([row.stage, row.count.toString(), row.value.toString()]);
    });
    rows.push([]);

    // Revenue Trend
    rows.push(['REVENUE TREND']);
    rows.push(['Month', 'Revenue', 'Target']);
    analytics.revenue_trend.forEach((row: RevenueData) => {
        rows.push([row.month, row.revenue.toString(), row.target.toString()]);
    });
    rows.push([]);

    // Sales Performance
    rows.push(['SALES PERFORMANCE']);
    rows.push(['Sales Rep', 'Deals Won', 'Revenue', 'Conversion Rate']);
    analytics.sales_performance.forEach((row: SalesPerformanceData) => {
        rows.push([row.name, row.deals_won.toString(), row.revenue.toString(), `${row.conversion_rate.toFixed(1)}%`]);
    });

    // Convert to CSV string
    const csvContent = rows.map(row =>
        row.map(cell => {
            // Escape quotes and wrap in quotes if contains comma
            const escaped = cell.replace(/"/g, '""');
            return escaped.includes(',') ? `"${escaped}"` : escaped;
        }).join(',')
    ).join('\n');

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `crm-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
