export type Language = 'en' | 'ar' | 'fr' | 'es';

export const translations: Record<Language, any> = {
  en: {
    nav: {
      home: 'Home',
      shop: 'Shop',
      admin: 'Admin'
    },
    home: {
      heroTitle: 'LuxeStore',
      heroSubtitle: 'Curated elegance for your modern sanctuary. Discover timeless pieces crafted for longevity.',
      shopNow: 'Shop Now',
      featured: 'Featured',
      newArrivals: 'New Arrivals',
      viewAll: 'View All'
    },
    products: {
      collection: 'The Collection',
      title: 'Our Products',
      loading: 'Loading products...'
    },
    productDetail: {
      back: 'Back',
      buyNow: 'Buy Now',
      notFound: 'Product not found',
      backToShop: 'Back to Shop',
      features: [
        'Premium Quality Materials',
        'Ethically Sourced & Crafted',
        'Timeless Design Aesthetic'
      ]
    },
    footer: {
      rights: 'All rights reserved.'
    }
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      shop: 'المتجر',
      admin: 'الإدارة'
    },
    home: {
      heroTitle: 'لوكس ستور',
      heroSubtitle: 'أناقة مختارة لملاذك الحديث. اكتشف قطعاً خالدة صُممت لتدوم.',
      shopNow: 'تسوق الآن',
      featured: 'مميز',
      newArrivals: 'وصل حديثاً',
      viewAll: 'عرض الكل'
    },
    products: {
      collection: 'المجموعة',
      title: 'منتجاتنا',
      loading: 'جاري تحميل المنتجات...'
    },
    productDetail: {
      back: 'رجوع',
      buyNow: 'اشتري الآن',
      notFound: 'المنتج غير موجود',
      backToShop: 'العودة للمتجر',
      features: [
        'مواد عالية الجودة',
        'مصادر أخلاقية وصناعة يدوية',
        'تصميم جمالي خالد'
      ]
    },
    footer: {
      rights: 'جميع الحقوق محفوظة.'
    }
  },
  fr: {
    nav: {
      home: 'Accueil',
      shop: 'Boutique',
      admin: 'Admin'
    },
    home: {
      heroTitle: 'LuxeStore',
      heroSubtitle: 'Élégance organisée pour votre sanctuaire moderne. Découvrez des pièces intemporelles conçues pour la longévité.',
      shopNow: 'Acheter maintenant',
      featured: 'Vedette',
      newArrivals: 'Nouveautés',
      viewAll: 'Voir tout'
    },
    products: {
      collection: 'La Collection',
      title: 'Nos Produits',
      loading: 'Chargement des produits...'
    },
    productDetail: {
      back: 'Retour',
      buyNow: 'Acheter maintenant',
      notFound: 'Produit non trouvé',
      backToShop: 'Retour à la boutique',
      features: [
        'Matériaux de qualité supérieure',
        'Sourcé et fabriqué de manière éthique',
        'Esthétique de design intemporelle'
      ]
    },
    footer: {
      rights: 'Tous droits réservés.'
    }
  },
  es: {
    nav: {
      home: 'Inicio',
      shop: 'Tienda',
      admin: 'Admin'
    },
    home: {
      heroTitle: 'LuxeStore',
      heroSubtitle: 'Elegancia seleccionada para su santuario moderno. Descubra piezas atemporales diseñadas para la longevidad.',
      shopNow: 'Comprar ahora',
      featured: 'Destacado',
      newArrivals: 'Novedades',
      viewAll: 'Ver todo'
    },
    products: {
      collection: 'La Colección',
      title: 'Nuestros Productos',
      loading: 'Cargando productos...'
    },
    productDetail: {
      back: 'Volver',
      buyNow: 'Comprar ahora',
      notFound: 'Producto no encontrado',
      backToShop: 'Volver a la tienda',
      features: [
        'Materiales de calidad premium',
        'De origen ético y artesanal',
        'Estética de diseño atemporal'
      ]
    },
    footer: {
      rights: 'Todos los derechos reservados.'
    }
  }
};
