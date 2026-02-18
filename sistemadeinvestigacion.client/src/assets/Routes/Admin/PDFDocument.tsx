import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font
} from '@react-pdf/renderer';
const styles = StyleSheet.create({
    page: {
        padding: 50,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        borderBottom: 2,
        borderBottomColor: '#002855', 
        paddingBottom: 10,
    },
    categoryBadge: {
        backgroundColor: '#3b82f6',
        color: '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 10,
        width: 'auto',
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#002855',
        textTransform: 'uppercase',
    },
    imageContainer: {
        marginVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: 20,
        height: 250,
    },
    image: {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
    },
    contentSection: {
        marginTop: 10,
    },
    description: {
        fontSize: 14,
        color: '#002855',
        marginBottom: 15,
        fontStyle: 'italic',
        fontWeight: 'bold',
        lineHeight: 1.4,
    },
    details: {
        fontSize: 11,
        color: '#334155',
        lineHeight: 1.6,
        textAlign: 'justify',
    },
    infoGrid: {
        marginTop: 30,
        paddingTop: 15,
        borderTop: 1,
        borderTopColor: '#e2e8f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoItem: {
        fontSize: 9,
        color: '#64748b',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 50,
        right: 50,
        textAlign: 'center',
        borderTop: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
        fontSize: 8,
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
});
interface PDFProps {
    data: {
        titulo: string;
        descripcion: string;
        detallesDescripcion?: string;
        nombreCategoria: string;
        estado?: string;
        fechaVencimiento?: string;
    };
    logoUrl: string | null;
}
export const PDFDocument: React.FC<PDFProps> = ({ data, logoUrl }) => {
    const fechaGeneracion = new Date().toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <Document title={`Acuerdo - ${data.titulo}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.categoryBadge}>{data.nombreCategoria}</Text>
                    <Text style={styles.title}>{data.titulo}</Text>
                </View>
                <View style={styles.imageContainer}>
                    {logoUrl ? (
                        <Image
                            src={{
                                uri: logoUrl,
                                method: 'GET',
                                headers: { 'Cache-Control': 'no-cache' }
                            }}
                            style={styles.image}
                        />
                    ) : (
                        <Text style={{ color: '#cbd5e1', fontSize: 12 }}>Imagen no disponible</Text>
                    )}
                </View>
                <View style={styles.contentSection}>
                    <Text style={styles.description}>"{data.descripcion}"</Text>
                    <Text style={styles.details}>
                        {data.detallesDescripcion || "No hay detalles adicionales disponibles para este convenio en este momento."}
                    </Text>
                </View>
                <View style={styles.infoGrid}>
                    <Text style={styles.infoItem}>Estado: {data.estado || 'Activo'}</Text>
                    {data.fechaVencimiento && (
                        <Text style={styles.infoItem}>Vigente hasta: {data.fechaVencimiento}</Text>
                    )}
                </View>
                <View style={styles.footer}>
                    <Text>Documento Acuerdos PDI SISAC {new Date().getFullYear()}</Text>
                    <Text style={{ marginTop: 4 }}>Generado el: {fechaGeneracion}</Text>
                </View>

            </Page>
        </Document>
    );
};