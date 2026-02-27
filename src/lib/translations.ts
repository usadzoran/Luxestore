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
      whyLove: "Why You'll Love It",
      crafted: 'Crafted for Perfection',
      customerStories: 'Customer Stories',
      reviewsSub: 'Real feedback from real users',
      avgRating: 'Average Rating',
      faqTitle: 'Frequently Asked Questions',
      faqSub: 'Everything you need to know',
      readyTitle: 'Ready to Transform Your Space?',
      readySub: 'Join over 10,000 happy customers who have already upgraded their sanctuary.',
      getNow: 'Get Yours Now',
      guarantee: '30-Day Guarantee',
      shipping: 'Free Worldwide Shipping',
      support: '24/7 Support',
      watchShowcase: 'Watch Product Showcase',
      handmade: 'Handmade',
      ecoFriendly: 'Eco-Friendly',
      onlyLeft: 'Only {count} left in stock!',
      saleEnds: 'Flash sale ends in:',
      viewing: '{count} people are viewing this product right now',
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
      whyLove: 'لماذا ستحبه',
      crafted: 'صُنع بإتقان',
      customerStories: 'قصص العملاء',
      reviewsSub: 'آراء حقيقية من مستخدمين حقيقيين',
      avgRating: 'متوسط التقييم',
      faqTitle: 'الأسئلة الشائعة',
      faqSub: 'كل ما تحتاج لمعرفته',
      readyTitle: 'هل أنت مستعد لتغيير مساحتك؟',
      readySub: 'انضم إلى أكثر من 10,000 عميل سعيد قاموا بالفعل بترقية ملاذهم.',
      getNow: 'احصل عليه الآن',
      guarantee: 'ضمان لمدة 30 يوماً',
      shipping: 'شحن مجاني لجميع أنحاء العالم',
      support: 'دعم على مدار الساعة',
      watchShowcase: 'شاهد عرض المنتج',
      handmade: 'صناعة يدوية',
      ecoFriendly: 'صديق للبيئة',
      onlyLeft: 'بقي {count} فقط في المخزون!',
      saleEnds: 'ينتهي العرض السريع خلال:',
      viewing: '{count} أشخاص يشاهدون هذا المنتج الآن',
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
      whyLove: 'Pourquoi vous allez l\'adorer',
      crafted: 'Conçu pour la perfection',
      customerStories: 'Histoires de clients',
      reviewsSub: 'Vrais retours de vrais utilisateurs',
      avgRating: 'Note moyenne',
      faqTitle: 'Questions fréquemment posées',
      faqSub: 'Tout ce que vous devez savoir',
      readyTitle: 'Prêt à transformer votre espace ?',
      readySub: 'Rejoignez plus de 10 000 clients satisfaits qui ont déjà amélioré leur sanctuaire.',
      getNow: 'Obtenez le vôtre maintenant',
      guarantee: 'Garantie de 30 jours',
      shipping: 'Livraison gratuite dans le monde entier',
      support: 'Support 24/7',
      watchShowcase: 'Voir la présentation du produit',
      handmade: 'Fait main',
      ecoFriendly: 'Écologique',
      onlyLeft: 'Plus que {count} en stock !',
      saleEnds: 'La vente flash se termine dans :',
      viewing: '{count} personnes consultent ce produit en ce moment',
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
      whyLove: 'Por qué te encantará',
      crafted: 'Diseñado para la perfección',
      customerStories: 'Historias de clientes',
      reviewsSub: 'Comentarios reales de usuarios reales',
      avgRating: 'Calificación promedio',
      faqTitle: 'Preguntas frecuentes',
      faqSub: 'Todo lo que necesitas saber',
      readyTitle: '¿Listo para transformar tu espacio?',
      readySub: 'Únete a más de 10,000 clientes satisfechos que ya han mejorado su santuario.',
      getNow: 'Consigue el tuyo ahora',
      guarantee: 'Garantía de 30 días',
      shipping: 'Envío mundial gratuito',
      support: 'Soporte 24/7',
      watchShowcase: 'Ver presentación del producto',
      handmade: 'Hecho a mano',
      ecoFriendly: 'Ecológico',
      onlyLeft: '¡Solo quedan {count} en stock!',
      saleEnds: 'La oferta flash termina en:',
      viewing: '{count} personas están viendo este producto ahora mismo',
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
