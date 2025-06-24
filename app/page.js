'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import React from 'react';
import { auth, db, storage } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc, onSnapshot, query } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';
import { runTransaction } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-white flex items-center justify-center p-4 z-[1000]">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-semibold text-red-800">Something went wrong</h3>
            </div>
            <p className="text-gray-700 mb-4">We're sorry for the inconvenience. The application has encountered an error.</p>
            <div className="bg-gray-100 p-3 rounded text-sm text-gray-800 mb-4">
              <p><strong>Error:</strong> {this.state.error?.message}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Admin Context
const AdminContext = React.createContext();

// Language Context
const LanguageContext = React.createContext();

// Loading Animation Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Language translations
const translations = {
  en: {
    home: "Home",
    products: "Products",
    about: "About",
    science: "Science",
    contact: "Contact",
    login: "Admin Login",
    logout: "Logout",
    searchPlaceholder: "Search products by name or description...",
    allProducts: "All Products",
    addNewProduct: "Add New Product",
    edit: "Edit",
    delete: "Delete",
    aboutTitle: "About Sardeli",
    aboutDescription: "Founded with a mission to bring the highest quality medical supplements to the market, Sardeli partners with world-class manufacturers to import scientifically validated health products.",
    aboutDescription2: "Our rigorous selection process ensures that every product in our portfolio meets stringent quality standards and delivers measurable health benefits.",
    qualityPromise: "Our Quality Promise",
    qualityPromiseSubtitle: "Every batch tested for purity and potency",
    qualityPromiseDescription: "Certified by international health authorities",
    contactTitle: "Get In Touch",
    contactDescription: "Have questions about our products or need recommendations? Our team of health experts is here to help.",
    callUs: "Call Us",
    emailUs: "Email Us",
    visitUs: "Visit Us",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    subject: "Subject",
    message: "Message",
    sendMessage: "Send Message",
    productInquiry: "Product Inquiry",
    orderSupport: "Order Support",
    medicalQuestions: "Medical Questions",
    other: "Other",
    yourMessage: "Your message here...",
    categoryManagement: "Category Management",
    newCategory: "New Category",
    addCategory: "Add Category",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    productName: "Product Name",
    category: "Category",
    description: "Description",
    size: "Size",
    benefits: "Benefits",
    ingredients: "Ingredients",
    title: "Title",
    subtitle: "Subtitle",
    productDetails: "Product Details",
    keyBenefits: "Key Benefits",
    activeIngredients: "Active Ingredients",
    noProductsFound: "No products found",
    tryAdjustingSearch: "Try adjusting your search or filters to find what you're looking for.",
    shopNow: "Shop Now",
    speakToExpert: "Speak to an Expert",
    whatsappUs: "Contact Us",
    emailUs: "Email Us",
    evidenceBasedFormulations: "Evidence-Based Formulations",
    evidenceBasedDescription: "Each ingredient is selected based on peer-reviewed clinical studies demonstrating its effectiveness for the intended health benefit.",
    qualityAssurance: "Quality Assurance",
    qualityAssuranceDescription: "Rigorous testing for purity, potency, and absence of contaminants ensures you receive exactly what's on the label.",
    optimalBioavailability: "Optimal Bioavailability",
    optimalBioavailabilityDescription: "We use advanced delivery systems to enhance absorption and ensure your body can utilize the nutrients effectively.",
    clinicallyProven: "Clinically Proven",
    pharmaceuticalGrade: "Pharmaceutical Grade",
    gmpCertified: "GMP Certified",
    readyToExperience: "Ready to Experience the Sardeli Difference?",
    joinThousands: "Join thousands of healthcare professionals who trust our premium supplements for their patients.",
    footerDescription: "Premium medical supplements backed by science and trusted by healthcare professionals.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    sitemap: "Sitemap",
    copyright: "© {year} Sardeli. All rights reserved.",
    productNamePlaceholder: "Product Name",
    descriptionPlaceholder: "Description",
    sizePlaceholder: "Size",
    benefitPlaceholder: "Benefit {index}",
    ingredientPlaceholder: "Ingredient {index}",
    firstNamePlaceholder: "Your first name",
    lastNamePlaceholder: "Your last name",
    emailPlaceholder: "your.email@example.com",
    subjectPlaceholder: "Select a subject",
    callUsContent: ["+964 (770) 123-4567", "Sat-Thu, 9am-5pm"],
    emailUsContent: ["Sardeliparis@outlook.com", "Typically respond within 24 hours"],
    visitUsContent: [
      "123 Main Street, City, Country",
      <a key="google-maps-link-en" href="https://www.google.com/maps?q=123+Main+Street,+City,+Country" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
    ],
    whatsappNumber: "+9647701234567",
    whatsappMessage: "Hello, I have a question about your products",
    emailAddress: "Sardeliparis@outlook.com",
    emailSubject: "Inquiry about your products",
    emailBody: "Hello, I have a question about your products",
    "Premium Medical Supplements": "Premium Medical Supplements",
    "for Optimal Health": "for Optimal Health",
    "Explore Products": "Explore Products",
    "Learn the Science": "Learn the Science",
    "Scientifically formulated, clinically tested supplements imported with the highest quality standards to support your health journey.": "Scientifically formulated, clinically tested supplements imported with the highest quality standards to support your health journey.",
    "Our Premium Supplement Range": "Our Premium Supplement Range",
    "Carefully formulated supplements targeting specific health needs with clinically proven ingredients.": "Carefully formulated supplements targeting specific health needs with clinically proven ingredients.",
    "Rigorous quality control at every production stage": "Rigorous quality control at every production stage",
    "Clinically proven ingredients at effective dosages": "Clinically proven ingredients at effective dosages",
    "Transparent sourcing and manufacturing processes": "Transparent sourcing and manufacturing processes",
    "Trusted by healthcare professionals worldwide": "Trusted by healthcare professionals worldwide",
    "The Science Behind Our Products": "The Science Behind Our Products",
    "Our supplements are developed based on the latest scientific research and formulated by medical experts to ensure efficacy and safety.": "Our supplements are developed based on the latest scientific research and formulated by medical experts to ensure efficacy and safety.",
    "company": "Company",
    "resources": "Resources",
    "qualityStandards": "Quality Standards",
    "press": "Press",
    "careers": "Careers",
    "blog": "Blog",
    "research": "Research",
    "faq": "FAQ",
    "shippingReturns": "Shipping & Returns",
    "contactUs": "Contact Us",
    "View Details": "View Details",
    "more": "more",
    "Edit": "Edit",
    "Delete": "Delete",
    "Product Image": "Product Image",
    "Upload an image": "Upload an image",
    "Basic Info": "Basic Info",
    "Details": "Details",
    "Benefits (up to 10)": "Benefits (up to 10)",
    "Benefit": "Benefit",
    "Size": "Size",
    "Ingredients (up to 10)": "Ingredients (up to 10)",
    "Ingredient": "Ingredient",
    "Save Product": "Save Product",
    "Image": "Image",
    "About Us Preview": "About Us Preview",
    "Save Changes": "Save Changes",
    "Image size exceeds the maximum limit of 5MB": "Image size exceeds the maximum limit of 5MB",
    "Error uploading image": "Error uploading image",
    "Image uploaded successfully": "Image uploaded successfully",
    "Error deleting image": "Error deleting image",
    "Image deleted successfully": "Image deleted successfully",
    "Are you sure you want to delete this product?": "Are you sure you want to delete this product?",
    "Are you sure you want to delete this category? Products in this category will be unaffected.": "Are you sure you want to delete this category? Products in this category will be unaffected.",
    "Invalid credentials": "Invalid credentials",
    "Password": "Password",
    "Click to upload": "Click to upload",
    "Location on Google Maps": "Location on Google Maps",
    "We typically respond within a few hours": "We typically respond within a few hours",
    "Connect with us": "Connect with us",
    "Send us a message": "Send us a message",
    "Contact Options": "Contact Options",
    "Choose your preferred way to contact us": "Choose your preferred way to contact us",
    "Message sent successfully!": "Message sent successfully!",
    "Failed to send message. Please try again later.": "Failed to send message. Please try again later.",
    "Our Location": "Our Location",
    "Find us on the map": "Find us on the map"
  },
  fr: {
    home: "Accueil",
    products: "Produits",
    about: "À Propos",
    science: "Science",
    contact: "Contact",
    login: "Connexion Admin",
    logout: "Déconnexion",
    searchPlaceholder: "Rechercher des produits par nom ou description...",
    allProducts: "Tous les Produits",
    addNewProduct: "Ajouter un Nouveau Produit",
    edit: "Modifier",
    delete: "Supprimer",
    aboutTitle: "À Propos de Sardeli",
    aboutDescription: "Fondée avec pour mission d'apporter les compléments médicaux de la plus haute qualité sur le marché, Sardeli s'associe à des fabricants de classe mondiale pour importer des produits de santé scientifiquement validés.",
    aboutDescription2: "Notre processus de sélection rigoureux garantit que chaque produit de notre portefeuille répond à des normes de qualité strictes et offre des avantages mesurables pour la santé.",
    qualityPromise: "Notre Promesse de Qualité",
    qualityPromiseSubtitle: "Chaque lot testé pour la pureté et la puissance",
    qualityPromiseDescription: "Certifié par les autorités sanitaires internationales",
    contactTitle: "Contactez-Nous",
    contactDescription: "Vous avez des questions sur nos produits ou besoin de recommandations ? Notre équipe d'experts en santé est là pour vous aider.",
    callUs: "Appelez-Nous",
    emailUs: "Envoyez-Nous un Email",
    visitUs: "Visitez-Nous",
    firstName: "Prénom",
    lastName: "Nom de Famille",
    email: "Adresse Email",
    subject: "Sujet",
    message: "Message",
    sendMessage: "Envoyer le Message",
    productInquiry: "Demande de Produit",
    orderSupport: "Support de Commande",
    medicalQuestions: "Questions Médicales",
    other: "Autre",
    yourMessage: "Votre message ici...",
    categoryManagement: "Gestion des Catégories",
    newCategory: "Nouvelle Catégorie",
    addCategory: "Ajouter une Catégorie",
    saveChanges: "Sauvegarder les Modifications",
    cancel: "Annuler",
    productName: "Nom du Produit",
    category: "Catégorie",
    description: "Description",
    size: "Taille",
    benefits: "Avantages",
    ingredients: "Ingrédients",
    title: "Titre",
    subtitle: "Sous-titre",
    productDetails: "Détails du Produit",
    keyBenefits: "Avantages Clés",
    activeIngredients: "Ingrédients Actifs",
    noProductsFound: "Aucun produit trouvé",
    tryAdjustingSearch: "Essayez d'ajuster votre recherche ou vos filtres pour trouver ce que vous cherchez.",
    shopNow: "Acheter Maintenant",
    speakToExpert: "Parlez à un Expert",
    whatsappUs: "Contactez-nous",
    emailUs: "Envoyez-nous un email",
    evidenceBasedFormulations: "Formulations Basées sur des Preuves",
    evidenceBasedDescription: "Chaque ingrédient est sélectionné sur la base d'études cliniques évaluées par des pairs démontrant son efficacité pour le bénéfice de santé prévu.",
    qualityAssurance: "Assurance Qualité",
    qualityAssuranceDescription: "Des tests rigoureux pour la pureté, la puissance, et l'absence de contaminants garantissent que vous recevez exactement ce qui est indiqué sur l'étiquette.",
    optimalBioavailability: "Biodisponibilité Optimale",
    optimalBioavailabilityDescription: "Nous utilisons des systèmes de livraison avancés pour améliorer l'absorption et garantir que votre corps puisse utiliser les nutriments efficacement.",
    clinicallyProven: "Cliniquement Prouvé",
    pharmaceuticalGrade: "Qualité Pharmaceutique",
    gmpCertified: "Certifié BPF",
    readyToExperience: "Prêt à Découvrir la Différence Sardeli ?",
    joinThousands: "Rejoignez des milliers de professionnels de la santé qui font confiance à nos compléments premium pour leurs patients.",
    footerDescription: "Compléments médicaux premium soutenus par la science et dignes de confiance des professionnels de la santé.",
    privacyPolicy: "Politique de Confidentialité",
    termsOfService: "Conditions de Service",
    sitemap: "Plan du Site",
    copyright: "© {year} Sardeli. Tous droits réservés.",
    productNamePlaceholder: "Nom du Produit",
    descriptionPlaceholder: "Description",
    sizePlaceholder: "Taille",
    benefitPlaceholder: "Avantage {index}",
    ingredientPlaceholder: "Ingrédient {index}",
    firstNamePlaceholder: "Votre prénom",
    lastNamePlaceholder: "Votre nom de famille",
    emailPlaceholder: "votre.email@example.com",
    subjectPlaceholder: "Sélectionnez un sujet",
    callUsContent: ["+964 (770) 123-4567", "Sam-Dim, 9h-17h"],
    emailUsContent: ["Sardeliparis@outlook.com", "Réponse généralement sous 24 heures"],
    visitUsContent: [
      "123 Rue Principale, Ville, Pays",
      <a key="google-maps-link-fr" href="https://www.google.com/maps?q=123+Rue+Principale,+Ville,+Pays" target="_blank" rel="noopener noreferrer">Voir sur Google Maps</a>
    ],
    whatsappNumber: "+9647701234567",
    whatsappMessage: "Bonjour, j'ai une question sur vos produits",
    emailAddress: "Sardeliparis@outlook.com",
    emailSubject: "Question sur vos produits",
    emailBody: "Bonjour, j'ai une question sur vos produits",
    "Premium Medical Supplements": "Compléments Médicaux Premium",
    "for Optimal Health": "pour une Santé Optimale",
    "Explore Products": "Explorer les Produits",
    "Learn the Science": "Découvrir la Science",
    "Scientifically formulated, clinically tested supplements imported with the highest quality standards to support your health journey.": "Compléments scientifiquement formulés et cliniquement testés, importés selon les normes de qualité les plus élevées pour soutenir votre parcours de santé.",
    "Our Premium Supplement Range": "Notre Gamme de Compléments Premium",
    "Carefully formulated supplements targeting specific health needs with clinically proven ingredients.": "Compléments soigneusement formulés ciblant des besoins de santé spécifiques avec des ingrédients cliniquement prouvés.",
    "Rigorous quality control at every production stage": "Contrôle de qualité rigoureux à chaque étape de la production",
    "Clinically proven ingredients at effective dosages": "Ingrédients cliniquement prouvés à des dosages efficaces",
    "Transparent sourcing and manufacturing processes": "Processus de sourcing et de fabrication transparents",
    "Trusted by healthcare professionals worldwide": "Fait confiance par les professionnels de la santé du monde entier",
    "The Science Behind Our Products": "La Science Derrière Nos Produits",
    "Our supplements are developed based on the latest scientific research and formulated by medical experts to ensure efficacy and safety.": "Nos compléments sont développés sur la base des dernières recherches scientifiques et formulés par des experts médicaux pour garantir leur efficacité et leur sécurité.",
    "company": "Entreprise",
    "resources": "Ressources",
    "qualityStandards": "Normes de Qualité",
    "press": "Presse",
    "careers": "Carrières",
    "blog": "Blog",
    "research": "Recherche",
    "faq": "FAQ",
    "shippingReturns": "Livraison et Retours",
    "contactUs": "Contactez-nous",
    "View Details": "Voir les Détails",
    "more": "plus",
    "Edit": "Modifier",
    "Delete": "Supprimer",
    "Product Image": "Image du Produit",
    "Upload an image": "Télécharger une image",
    "Basic Info": "Informations de Base",
    "Details": "Détails",
    "Benefits (up to 10)": "Avantages (jusqu'à 10)",
    "Benefit": "Avantage",
    "Size": "Taille",
    "Ingredients (up to 10)": "Ingrédients (jusqu'à 10)",
    "Ingredient": "Ingrédient",
    "Save Product": "Sauvegarder le Produit",
    "Image": "Image",
    "About Us Preview": "Aperçu À Propos",
    "Save Changes": "Sauvegarder les Modifications",
    "Image size exceeds the maximum limit of 5MB": "La taille de l'image dépasse la limite maximale de 5MB",
    "Error uploading image": "Erreur lors du téléchargement de l'image",
    "Image uploaded successfully": "Image téléchargée avec succès",
    "Error deleting image": "Erreur lors de la suppression de l'image",
    "Image deleted successfully": "Image supprimée avec succès",
    "Are you sure you want to delete this product?": "Êtes-vous sûr de vouloir supprimer ce produit ?",
    "Are you sure you want to delete this category? Products in this category will be unaffected.": "Êtes-vous sûr de vouloir supprimer cette catégorie ? Les produits de cette catégorie ne seront pas affectés.",
    "Invalid credentials": "Identifiants invalides",
    "Password": "Mot de passe",
    "Click to upload": "Cliquez pour télécharger",
    "Location on Google Maps": "Emplacement sur Google Maps",
    "We typically respond within a few hours": "Nous répondons généralement dans les quelques heures",
    "Connect with us": "Connectez-vous avec nous",
    "Send us a message": "Envoyez-nous un message",
    "Contact Options": "Options de contact",
    "Choose your preferred way to contact us": "Choisissez votre méthode de contact préférée",
    "Message sent successfully!": "Message envoyé avec succès !",
    "Failed to send message. Please try again later.": "Échec de l'envoi du message. Veuillez réessayer plus tard.",
    "Our Location": "Notre emplacement",
    "Find us on the map": "Trouvez-nous sur la carte"
  },
  ar: {
    home: "الرئيسية",
    products: "المنتجات",
    about: "عن الشركة",
    science: "العلوم",
    contact: "اتصل بنا",
    login: "تسجيل الدخول للمدير",
    logout: "تسجيل الخروج",
    searchPlaceholder: "ابحث عن المنتجات حسب الاسم أو الوصف...",
    allProducts: "كل المنتجات",
    addNewProduct: "إضافة منتج جديد",
    edit: "تعديل",
    delete: "حذف",
    aboutTitle: "عن Sardeli",
    aboutDescription: "تأسست بهدف تقديم أفضل المكملات الطبية في السوق، تتعاون Sardeli مع مصنعين عالميين لاستيراد المنتجات الصحية المدعومة علمياً.",
    aboutDescription2: "عملية الاختيار الدقيقة تضمن أن كل منتج في محفظتنا يلبي معايير الجودة الصارمة ويقدم فوائد صحية قابلة للقياس.",
    qualityPromise: "وعدنا بالجودة",
    qualityPromiseSubtitle: "كل دفعة تخضع للاختبار من حيث النقاء والفاعلية",
    qualityPromiseDescription: "معتمد من السلطات الصحية الدولية",
    contactTitle: "تواصل معنا",
    contactDescription: "هل لديك أسئلة حول منتجاتنا أو تحتاج إلى توصيات؟ فريقنا من الخبراء الصحيين هنا لمساعدتك.",
    callUs: "اتصل بنا",
    emailUs: "راسلنا عبر البريد الإلكتروني",
    visitUs: "زرنا",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد الإلكتروني",
    subject: "الموضوع",
    message: "الرسالة",
    sendMessage: "إرسال الرسالة",
    productInquiry: "استفسار عن المنتج",
    orderSupport: "دعم الطلبات",
    medicalQuestions: "الأسئلة الطبية",
    other: "آخر",
    yourMessage: "رسالتك هنا...",
    categoryManagement: "إدارة الفئات",
    newCategory: "فئة جديدة",
    addCategory: "إضافة فئة",
    saveChanges: "حفظ التغييرات",
    cancel: "إلغاء",
    productName: "اسم المنتج",
    category: "الفئة",
    description: "الوصف",
    size: "الحجم",
    benefits: "الفوائد",
    ingredients: "المكونات",
    title: "العنوان",
    subtitle: "العنوان الفرعي",
    productDetails: "تفاصيل المنتج",
    keyBenefits: "الفوائد الرئيسية",
    activeIngredients: "المكونات الفعالة",
    noProductsFound: "لم يتم العثور على منتجات",
    tryAdjustingSearch: "حاول تعديل بحثك أو عوامل التصفية للعثور على ما تبحث عنه.",
    shopNow: "تسوق الآن",
    speakToExpert: "تحدث إلى خبير",
    whatsappUs: "تواصل معنا",
    emailUs: "راسلنا عبر البريد الإلكتروني",
    evidenceBasedFormulations: "صيغ قائمة على الأدلة",
    evidenceBasedDescription: "يتم اختيار كل مكون بناءً على دراسات سريرية مراجعة من قبل النظراء تثبت فعاليته للفائدة الصحية المقصودة.",
    qualityAssurance: "ضمان الجودة",
    qualityAssuranceDescription: "الاختبارات الصارمة للنقاء والفاعلية وغياب الملوثات تضمن حصولك على ما هو مكتوب على الملصق.",
    optimalBioavailability: "التوافر البيولوجي الأمثل",
    optimalBioavailabilityDescription: "نستخدم أنظمة توصيل متقدمة لتعزيز الامتصاص وضمان قدرة جسمك على استخدام العناصر الغذائية بفعالية.",
    clinicallyProven: "مثبت سريريًا",
    pharmaceuticalGrade: "جودة صيدلانية",
    gmpCertified: "معتمد من قبل م.ع.ج",
    readyToExperience: "هل أنت مستعد لتجربة الفرق مع Sardeli؟",
    joinThousands: "انضم إلى آلاف المتخصصين في الرعاية الصحية الذين يثقون بمكملاتنا المتميزة لمرضاهم.",
    footerDescription: "مكملات طبية متميزة مدعومة بالعلوم وموثوقة من قبل المتخصصين في الرعاية الصحية.",
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "شروط الخدمة",
    sitemap: "خريطة الموقع",
    copyright: "© {year} Sardeli. كل الحقوق محفوظة.",
    productNamePlaceholder: "اسم المنتج",
    descriptionPlaceholder: "الوصف",
    sizePlaceholder: "الحجم",
    benefitPlaceholder: "الفائدة {index}",
    ingredientPlaceholder: "المكون {index}",
    firstNamePlaceholder: "اسمك الأول",
    lastNamePlaceholder: "اسم العائل",
    emailPlaceholder: "بريدك الإلكتروني",
    subjectPlaceholder: "اختر موضوعًا",
    callUsContent: ["+964 (770) 123-4567", "السبت - الخميس، 9 صباحًا - 5 مساءً"],
    emailUsContent: ["Sardeliparis@outlook.com", "عادة ما يتم الرد خلال 24 ساعة"],
    visitUsContent: [
      "123 شارع رئيسي، مدينة، بلد",
      <a key="google-maps-link-ar" href="https://www.google.com/maps?q=123+شارع+رئيسي،+مدينة،+بلد" target="_blank" rel="noopener noreferrer">عرض على خرائط جوجل</a>
    ],
    whatsappNumber: "+9647701234567",
    whatsappMessage: "مرحبا، لدي استفسار عن منتجاتكم",
    emailAddress: "Sardeliparis@outlook.com",
    emailSubject: "استفسار عن منتجاتكم",
    emailBody: "مرحبا، لدي استفسار عن منتجاتكم",
    "Premium Medical Supplements": "مكملات طبية متميزة",
    "for Optimal Health": "لصحة مثلى",
    "Explore Products": "استكشف المنتجات",
    "Learn the Science": "تعرف على العلم",
    "Scientifically formulated, clinically tested supplements imported with the highest quality standards to support your health journey.": "مكملات مصنوعة علمياً ومختبرة سريرياً مستوردة بأعلى معايير الجودة لدعم رحلتك الصحية.",
    "Our Premium Supplement Range": "نطاق المكملات المتميزة لدينا",
    "Carefully formulated supplements targeting specific health needs with clinically proven ingredients.": "مكملات مصنوعة بعناية تستهدف احتياجات صحية محددة مع مكونات مثبتة سريرياً.",
    "Rigorous quality control at every production stage": "مراقبة جودة صارمة في كل مرحلة من مراحل الإنتاج",
    "Clinically proven ingredients at effective dosages": "مكونات مثبتة سريرياً بجرعات فعالة",
    "Transparent sourcing and manufacturing processes": "عمليات الحصول على المواد الخام والتصنيع الشفافة",
    "Trusted by healthcare professionals worldwide": "موثوق بها من قبل المتخصصين في الرعاية الصحية في جميع أنحاء العالم",
    "The Science Behind Our Products": "العلم وراء منتجاتنا",
    "Our supplements are developed based on أحدث الأبحاث العلمية وصيغتها من قبل خبراء طبيين لضمان الفعالية والسلامة.": "تم تطوير مكملاتنا بناءً على أحدث الأبحاث العلمية وصيغتها من قبل خبراء طبيين لضمان الفعالية والسلامة.",
    "company": "الشركة",
    "resources": "الموارد",
    "qualityStandards": "معايير الجودة",
    "press": "الصحافة",
    "careers": "الوظائف",
    "blog": "المدونة",
    "research": "البحوث",
    "faq": "الأسئلة الشائعة",
    "shippingReturns": "الشحن والإرجاع",
    "contactUs": "اتصل بنا",
    "View Details": "عرض التفاصيل",
    "more": "المزيد",
    "Edit": "تعديل",
    "Delete": "حذف",
    "Product Image": "صورة المنتج",
    "Upload an image": "تحميل صورة",
    "Basic Info": "المعلومات الأساسية",
    "Details": "التفاصيل",
    "Benefits (up to 10)": "الفوائد (حتى 10)",
    "Benefit": "فائدة",
    "Size": "الحجم",
    "Ingredients (up to 10)": "المكونات (حتى 10)",
    "Ingredient": "مكون",
    "Save Product": "حفظ المنتج",
    "Image": "صورة",
    "About Us Preview": "معاينة عنا",
    "Save Changes": "حفظ التغييرات",
    "Image size exceeds the maximum limit of 5MB": "حجم الصورة يتجاوز الحد الأقصى البالغ 5MB",
    "Error uploading image": "خطأ في تحميل الصورة",
    "Image uploaded successfully": "تم تحميل الصورة بنجاح",
    "Error deleting image": "خطأ في حذف الصورة",
    "Image deleted successfully": "تم حذف الصورة بنجاح",
    "Are you sure you want to delete this product?": "هل أنت متأكد أنك تريد حذف هذا المنتج؟",
    "Are you sure you want to delete this category? Products in this category will be unaffected.": "هل أنت متأكد أنك تريد حذف هذه الفئة؟ لن تتأثر المنتجات في هذه الفئة.",
    "Invalid credentials": "بيانات الاعتماد غير صالحة",
    "Password": "كلمة المرور",
    "Click to upload": "انقر للتحميل",
    "Location on Google Maps": "الموقع على خرائط جوجل",
    "We typically respond within a few hours": "عادة ما نرد في غضون ساعات قليلة",
    "Connect with us": "تواصل معنا",
    "Send us a message": "أرسل لنا رسالة",
    "Contact Options": "خيارات الاتصال",
    "Choose your preferred way to contact us": "اختر الطريقة المفضلة للتواصل معنا",
    "Message sent successfully!": "تم إرسال الرسالة بنجاح!",
    "Failed to send message. Please try again later.": "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى لاحقًا.",
    "Our Location": "موقعنا",
    "Find us on the map": "ابحث عنا على الخريطة"
  }
};

// BeforeAfterSlider Component
const BeforeAfterSlider = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  }, [isDragging]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const container = containerRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    const x = touch.clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  }, [isDragging]);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUpGlobal);
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mouseup', handleMouseUpGlobal);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, handleMouseMove]);

  useEffect(() => {
    const preloadImages = [beforeImage, afterImage];
    Promise.all(preloadImages.map(src => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve;
      });
    })).then(() => setIsLoaded(true));
  }, [beforeImage, afterImage]);

  if (!isLoaded) return <LoadingSpinner />;

  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
      <div className="relative w-full h-[450px]">
        <div
          ref={containerRef}
          className="relative w-full h-full cursor-ew-resize touch-none select-none"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <Image
              src={beforeImage}
              alt="Before treatment"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            />
          </div>
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <Image
              src={afterImage}
              alt="After treatment"
              fill
              className="object-cover my-1.5"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            />
          </div>
          <div
            className="absolute top-0 bottom-0 w-1 bg-blue-600 transform -translate-x-1/2"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-white z-20">
              <div className="w-6 h-0.5 bg-blue-600"></div>
              <div className="absolute -inset-2 rounded-full border-2 border-blue-200 border-dashed"></div>
            </div>
          </div>
        </div>
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm font-medium text-gray-800 shadow-lg">
          Before
        </div>
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm font-medium text-gray-800 shadow-lg">
          After
        </div>
      </div>
    </div>
  );
};

// FadeInWhenVisible Component
const FadeInWhenVisible = ({ children, delay = 0, className = '' }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Admin Login Modal
const AdminLoginModal = ({ isOpen, onClose, onLogin, t }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('isAuthenticated', 'true');
      onLogin();
    } catch (error) {
      console.error('Login error:', error);
      setError(t('Invalid credentials'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('login')}</h2>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('Password')}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md focus:outline-none disabled:opacity-50"
                disabled={isLoading}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-70 flex items-center"
                disabled={isLoading}
              >
                {isLoading && <LoadingSpinner />}
                {t('login')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// Image Upload Component
const ImageUpload = ({ image, onImageChange, t }) => {
  const [previewUrl, setPreviewUrl] = useState(image || '');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ message: '', isError: false });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadStatus({ message: t('Image size exceeds the maximum limit of 5MB'), isError: true });
      return;
    }
    try {
      setIsLoading(true);
      setUploadStatus({ message: '', isError: false });
      const options = {
        maxSizeMB: 5,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
        maxIteration: 20,
        initialQuality: 0.8,
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target.result);
        onImageChange(event.target.result);
        setUploadStatus({ message: t('Image uploaded successfully'), isError: false });
        setIsLoading(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      setUploadStatus({ message: t('Error uploading image'), isError: true });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{t('Product Image')}</h3>
      <p className="text-sm text-gray-700">{t('Upload an image')}</p>
      {isLoading && <LoadingSpinner />}
      {uploadStatus.message && (
        <div className={`p-3 rounded-md ${uploadStatus.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {uploadStatus.message}
        </div>
      )}
      <div className="grid gap-4">
        <div className="space-y-2">
          <label
            htmlFor="image-upload"
            className="block aspect-square rounded-lg border-2 border-dashed cursor-pointer flex flex-col items-center justify-center p-4 relative border-gray-300 hover:border-blue-400 transition-colors"
          >
            {previewUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={previewUrl}
                  alt="Product preview"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-700">{t('Click to upload')}</span>
              </>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

// ProductForm Component with Tabs
const ProductForm = ({ product, onSave, onCancel, categories, t }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    id: product?.id || Date.now().toString(),
    name: product?.name || '',
    category: product?.category || (categories.length > 0 ? categories[0] : ''),
    description: product?.description || '',
    benefits: product?.benefits || ['', '', '', '', '', '', '', '', '', ''],
    image: product?.image || '',
    size: product?.size || '',
    ingredients: product?.ingredients || ['', '', '', '', '', '', '', '', '', ''],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = t('productName') + ' is required';
    if (!formData.category) errors.category = t('category') + ' is required';
    if (!formData.description.trim()) errors.description = t('description') + ' is required';
    if (!formData.size.trim()) errors.size = t('size') + ' is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleArrayChange = (index, value, field) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleImageChange = (value) => {
    setFormData(prev => ({ ...prev, image: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    const filteredBenefits = formData.benefits.filter(benefit => benefit.trim() !== '');
    const filteredIngredients = formData.ingredients.filter(ingredient => ingredient.trim() !== '');
    const productData = {
      ...formData,
      benefits: filteredBenefits,
      ingredients: filteredIngredients
    };
    try {
      const productRef = doc(db, 'products', productData.id.toString());
      await setDoc(productRef, productData);
      onSave(productData);
    } catch (error) {
      console.error('Error saving product:', error);
      setValidationErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {['basic', 'details'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(tab.charAt(0).toUpperCase() + tab.slice(1) + ' Info')}
            </button>
          ))}
        </div>
        {validationErrors.submit && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{validationErrors.submit}</p>
          </div>
        )}
        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('productName')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('category')}
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      validationErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {t(category)}
                      </option>
                    ))}
                  </select>
                  {validationErrors.category && <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('description')}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                    validationErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows="4"
                  required
                />
                {validationErrors.description && <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>}
              </div>
              <div>
                <ImageUpload
                  image={formData.image}
                  onImageChange={handleImageChange}
                  t={t}
                />
              </div>
            </div>
          )}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  {t('Benefits (up to 10)')}
                </label>
                <div className="space-y-4">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                    <div key={index}>
                      <input
                        type="text"
                        value={formData.benefits[index] || ''}
                        onChange={(e) => handleArrayChange(index, e.target.value, 'benefits')}
                        className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder={t('benefitPlaceholder').replace('{index}', index + 1)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('size')}
                </label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                    validationErrors.size ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.size && <p className="mt-1 text-sm text-red-600">{validationErrors.size}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  {t('Ingredients (up to 10)')}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
                    <div key={index}>
                      <input
                        type="text"
                        value={formData.ingredients[index] || ''}
                        onChange={(e) => handleArrayChange(index, e.target.value, 'ingredients')}
                        className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        placeholder={t('ingredientPlaceholder').replace('{index}', index + 1)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end p-6 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 mr-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            disabled={isSaving}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center disabled:opacity-70"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Saving...</span>
              </>
            ) : t('Save Product')}
          </button>
        </div>
      </div>
    </form>
  );
};

// AboutImageTextEditor Component
const AboutImageTextEditor = ({ aboutImage, aboutImageText, onSave, onCancel, t }) => {
  const [formData, setFormData] = useState({
    image: aboutImage || '',
    title: aboutImageText?.title || 'Our Quality Promise',
    subtitle: aboutImageText?.subtitle || 'Every batch tested for purity and potency',
    description: aboutImageText?.description || 'Certified by international health authorities'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ message: '', isError: false });
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = t('title') + ' is required';
    if (!formData.subtitle.trim()) errors.subtitle = t('subtitle') + ' is required';
    if (!formData.description.trim()) errors.description = t('description') + ' is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadStatus({ message: t('Image size exceeds the maximum limit of 5MB'), isError: true });
      return;
    }
    try {
      setIsLoading(true);
      setUploadStatus({ message: '', isError: false });
      const options = {
        maxSizeMB: 5,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
        maxIteration: 20,
        initialQuality: 0.8,
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, image: event.target.result }));
        setUploadStatus({ message: t('Image uploaded successfully'), isError: false });
        setIsLoading(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      setUploadStatus({ message: t('Error uploading image'), isError: true });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'about', 'imageText');
      await setDoc(docRef, {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        image: formData.image
      });
      onSave(formData);
    } catch (error) {
      console.error('Error saving about text:', error);
      setValidationErrors({ submit: t('Failed to save changes. Please try again.') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{t('About Us Preview')}</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {validationErrors.submit && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
              <p className="text-red-700">{validationErrors.submit}</p>
            </div>
          )}
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">{t('Image')}</h3>
                <div className="space-y-2">
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    {formData.image ? (
                      <Image
                        src={formData.image}
                        alt="About Us Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 16l4.586-4.586a2 2 0 002.828 0L16 16m-2-2l1.586-1.586a2 2 0 002.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex-1">
                      <div className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition text-center cursor-pointer">
                        {t('Upload an image')}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isLoading}
                        />
                      </div>
                    </label>
                  </div>
                  {isLoading && <LoadingSpinner />}
                  {uploadStatus.message && (
                    <div className={`p-3 rounded-md ${uploadStatus.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {uploadStatus.message}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('title')}
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      validationErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.title && <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>}
                </div>
                <div>
                  <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('subtitle')}
                  </label>
                  <input
                    type="text"
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      validationErrors.subtitle ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.subtitle && <p className="mt-1 text-sm text-red-600">{validationErrors.subtitle}</p>}
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('description')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      validationErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows="3"
                    required
                  />
                  {validationErrors.description && <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>}
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 bg-gray-50 border-t border-gray-200 sticky bottom-0">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 mr-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                disabled={isSaving}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center disabled:opacity-70"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">{t('Saving')}...</span>
                  </>
                ) : t('Save Changes')}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ContactOptions Component
const ContactOptions = ({ t }) => {
  const [activeTab, setActiveTab] = useState('whatsapp');

  const handleWhatsAppClick = () => {
    const phoneNumber = t('whatsappNumber').replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(t('whatsappMessage'));
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailClick = () => {
    const email = t('emailAddress');
    const subject = encodeURIComponent(t('emailSubject'));
    const body = encodeURIComponent(t('emailBody'));
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      window.location.href = `googlegmail:///co?subject=${subject}&body=${body}&to=${email}`;
    } else {
      const userConfirmed = window.confirm('Do you want to open your default email client to send us a message?');
      if (userConfirmed) {
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{t('Contact Options')}</h3>
        <p className="text-gray-600 mb-8 text-center">{t('Choose your preferred way to contact us')}</p>
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-full bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                activeTab === 'whatsapp' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <Image
                  src="/whatsapp_logo.png"
                  alt="WhatsApp"
                  width={30}
                  height={30}
                  className="mr-2"
                />
                WhatsApp
              </div>
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                activeTab === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <Image
                  src="/gmail_logo.png"
                  alt="Gmail"
                  width={30}
                  height={30}
                  className="mr-2"
                />
                Email
              </div>
            </button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {activeTab === 'whatsapp' && (
            <motion.div
              key="whatsapp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="w-24 h-24 mb-6 mx-auto relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                  className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur opacity-75"
                ></motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
                  className="relative bg-white p-1 rounded-full"
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <Image
                      src="/whatsapp_logo.png"
                      alt="WhatsApp"
                      width={100}
                      height={100}
                      className="object-contain"
                    />
                  </div>
                </motion.div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{t('Connect with us on WhatsApp')}</h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('We typically respond within a few hours')}
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWhatsAppClick}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-4xl transition-all duration-200 hover:shadow-lg flex items-center justify-center mx-auto"
              >
                <Image
                  src="/whatsapp_logo_button.png"
                  alt="WhatsApp"
                  width={30}
                  height={30}
                  className="mr-2"
                />
                {t('Send us a message')}
              </motion.button>
            </motion.div>
          )}
          {activeTab === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="w-24 h-24 mb-6 mx-auto relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                  className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur opacity-75"
                ></motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
                  className="relative bg-white p-1 rounded-full"
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                    <Image
                      src="/gmail_logo.png"
                      alt="Gmail"
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                </motion.div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{t('Email Us')}</h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('We typically respond within 24 hours')}
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEmailClick}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-2 px-7 rounded-4xl transition-all duration-200 hover:shadow-lg flex items-center justify-center mx-auto"
              >
                <Image
                  src="/gmail_logo_button.png"
                  alt="Gmail"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                {t('Send us a message')}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Main Component
export default function Home() {
  const [activeTab, setActiveTab] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingAboutText, setEditingAboutText] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalScrollPosition, setModalScrollPosition] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [aboutImageText, setAboutImageText] = useState({
    title: 'Our Quality Promise',
    subtitle: 'Every batch tested for purity and potency',
    description: 'Certified by international health authorities',
    image: '/about-lab.jpg'
  });

  useEffect(() => {
    const authState = localStorage.getItem('isAuthenticated') === 'true';
    setIsAdmin(authState);
    const fetchInitialData = async () => {
      try {
        const productsQuery = query(collection(db, 'products'));
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);

        const categoriesQuery = query(collection(db, 'categories'));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnapshot.docs.map(doc => doc.data().name);
        setCategories(categoriesData);

        const aboutDocRef = doc(db, 'about', 'imageText');
        const aboutDocSnap = await getDoc(aboutDocRef);
        if (aboutDocSnap.exists()) {
          setAboutImageText(aboutDocSnap.data());
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();

    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (querySnapshot) => {
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    });

    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (querySnapshot) => {
      const categoriesData = querySnapshot.docs.map(doc => doc.data().name);
      setCategories(categoriesData);
    });

    const unsubscribeAbout = onSnapshot(doc(db, 'about', 'imageText'), (docSnap) => {
      if (docSnap.exists()) {
        setAboutImageText(docSnap.data());
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
      unsubscribeAbout();
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleProductClick = (product) => {
    setModalScrollPosition(window.scrollY);
    setSelectedProduct(product);
    setIsModalOpen(true);
    setActiveSection('products');
  };

  const handleLogin = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('isAuthenticated');
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleSaveProduct = (product) => {
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm(t('Are you sure you want to delete this product?'))) {
      try {
        await deleteDoc(doc(db, 'products', productId.toString()));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const newCategoryInput = document.getElementById('newCategory');
    const newCategory = newCategoryInput.value.trim();
    if (!newCategory) {
      alert('Please enter a category name');
      return;
    }
    if (categories.includes(newCategory.toLowerCase())) {
      alert('This category already exists');
      return;
    }
    try {
      await addDoc(collection(db, 'categories'), { name: newCategory.toLowerCase() });
      newCategoryInput.value = '';
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category. Please try again.');
    }
  };

  const handleDeleteCategory = async (category) => {
    if (window.confirm(t('Are you sure you want to delete this category? Products in this category will be unaffected.'))) {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        for (const docSnapshot of querySnapshot.docs) {
          if (docSnapshot.data().name === category) {
            await deleteDoc(docSnapshot.ref);
            break;
          }
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const handleSaveAboutText = (data) => {
    setAboutImageText(data);
    setEditingAboutText(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      window.scrollTo(0, modalScrollPosition);
    }, 100);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
      const sections = ['home', 'products', 'about', 'science', 'contact'];
      let currentSection = 'home';
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = section;
          }
        }
      });
      setActiveSection(currentSection);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = products.filter(product =>
    (activeTab === 'all' || product.category === activeTab) &&
    (product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
     product.description.toLowerCase().includes(productSearchTerm.toLowerCase()))
  );

  const t = (key) => translations[language][key] || key;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
        <LanguageContext.Provider value={{ language, setLanguage }}>
          <div className="min-h-screen bg-white font-sans">
            <Head>
              <title>{t('Sardeli')} | {t('Premium Medical Supplements')}</title>
              <meta name="description" content={t('High-quality imported medical supplements for your health and wellness')} />
              <link rel="icon" href="/favicon.ico" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <motion.header
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur-sm py-4'}`}
            >
              <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center"
                >
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {t('Sardeli')}
                  </div>
                </motion.div>
                <nav className="hidden md:flex space-x-1 items-center">
                  {['home', 'products', 'about', 'science', 'contact'].map((section, index) => (
                    <motion.button
                      key={index}
                      onClick={() => scrollToSection(section)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-md font-medium transition-all ${
                        activeSection === section
                          ? 'bg-blue-100 text-blue-600 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {t(section)}
                    </motion.button>
                  ))}
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-md font-medium transition-all flex items-center ${
                        'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {language === 'en' ? 'English' : language === 'fr' ? 'Français' : 'العربية'}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.button>
                    {showLanguageDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50"
                      >
                        <button
                          onClick={() => {
                            setLanguage('en');
                            setShowLanguageDropdown(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          English
                        </button>
                        <button
                          onClick={() => {
                            setLanguage('fr');
                            setShowLanguageDropdown(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Français
                        </button>
                        <button
                          onClick={() => {
                            setLanguage('ar');
                            setShowLanguageDropdown(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          العربية
                        </button>
                      </motion.div>
                    )}
                  </div>
                  {!isAdmin ? (
                    <motion.button
                      onClick={() => setShowAdminLogin(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-md font-medium transition-all bg-blue-600 text-white hover:bg-blue-700 ml-2"
                    >
                      {t('login')}
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleLogout}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-md font-medium transition-all bg-red-500 text-white hover:bg-red-600 ml-2"
                    >
                      {t('logout')}
                    </motion.button>
                  )}
                </nav>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="md:hidden text-gray-800 focus:outline-none p-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMenuOpen ? (
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3 }}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <>
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16"
                        />
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 12h16"
                        />
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 18h16"
                        />
                      </>
                    )}
                  </svg>
                </motion.button>
              </div>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="md:hidden bg-white shadow-lg"
                  >
                    <div className="flex flex-col py-4 px-4 space-y-2">
                      {['home', 'products', 'about', 'science', 'contact'].map((section, index) => (
                        <motion.button
                          key={index}
                          onClick={() => {
                            scrollToSection(section);
                            setIsMenuOpen(false);
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className={`px-4 py-3 rounded-md text-left font-medium transition-all ${
                            activeSection === section
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {t(section)}
                        </motion.button>
                      ))}
                      <div className="relative">
                        <motion.button
                          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-3 rounded-md text-left font-medium text-gray-700 hover:bg-gray-100 w-full flex justify-between items-center"
                        >
                          {language === 'en' ? 'English' : language === 'fr' ? 'Français' : 'العربية'}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.button>
                        {showLanguageDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-md shadow-lg"
                          >
                            <button
                              onClick={() => {
                                setLanguage('en');
                                setShowLanguageDropdown(false);
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                              English
                            </button>
                            <button
                              onClick={() => {
                                setLanguage('fr');
                                setShowLanguageDropdown(false);
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Français
                            </button>
                            <button
                              onClick={() => {
                                setLanguage('ar');
                                setShowLanguageDropdown(false);
                              }}
                              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                            >
                              العربية
                            </button>
                          </motion.div>
                        )}
                      </div>
                      {!isAdmin ? (
                        <motion.button
                          onClick={() => {
                            setShowAdminLogin(true);
                            setIsMenuOpen(false);
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-3 rounded-md text-left font-medium text-white bg-blue-600 hover:bg-blue-700 w-full"
                        >
                          {t('login')}
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-3 rounded-md text-left font-medium text-white bg-red-500 hover:bg-red-600 w-full"
                        >
                          {t('logout')}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.header>
            <AdminLoginModal
              isOpen={showAdminLogin}
              onClose={() => setShowAdminLogin(false)}
              onLogin={handleLogin}
              t={t}
            />
            <section id="home" className="relative pt-28 pb-20 md:pt-36 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
              <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="lg:w-1/2 z-10">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: [0.17, 0.67, 0.12, 0.99] }}
                      className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                    >
                      {t('Premium Medical Supplements')} <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('for Optimal Health')}</span>
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2, ease: [0.17, 0.67, 0.12, 0.99] }}
                      className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg"
                    >
                      {t('Scientifically formulated, clinically tested supplements imported with the highest quality standards to support your health journey.')}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4, ease: [0.17, 0.67, 0.12, 0.99] }}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 20px -10px rgba(59, 130, 246, 0.5)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('products')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
                      >
                        {t('Explore Products')}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 20px -10px rgba(0, 0, 0, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => scrollToSection('science')}
                        className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition-all duration-300"
                      >
                        {t('Learn the Science')}
                      </motion.button>
                    </motion.div>
                  </div>
                  <div className="lg:w-1/2 w-full">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.3, ease: [0.17, 0.67, 0.12, 0.99] }}
                      className="relative w-full max-w-2xl mx-auto"
                    >
                      <BeforeAfterSlider
                        beforeImage='/with_acne.jpg'
                        afterImage="/without_acne.jpg"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>
            <section id="products" className="py-20 bg-gray-50">
              <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                  <FadeInWhenVisible>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      {t('Our Premium Supplement Range')}
                    </h2>
                  </FadeInWhenVisible>
                  <FadeInWhenVisible delay={0.1}>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      {t('Carefully formulated supplements targeting specific health needs with clinically proven ingredients.')}
                    </p>
                  </FadeInWhenVisible>
                </div>
                <FadeInWhenVisible delay={0.1}>
                  <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative text-gray-600">
                      <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="w-full px-6 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                      />
                      <svg className="absolute right-4 top-4 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </FadeInWhenVisible>
                <FadeInWhenVisible delay={0.2}>
                  <div className="flex flex-wrap justify-center mb-12 gap-2">
                    {[
                      { id: 'all', label: t('allProducts') },
                      ...categories.map((category, index) => ({
                        id: category,
                        label: t(category)
                      }))
                    ].map((tab, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {tab.label}
                      </motion.button>
                    ))}
                  </div>
                </FadeInWhenVisible>
                {isAdmin && (
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setEditingProduct({})}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                    >
                      {t('addNewProduct')}
                    </button>
                  </div>
                )}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.map((product, index) => (
                      <FadeInWhenVisible key={product.id} delay={index * 0.05}>
                        <motion.div
                          whileHover={{ y: -5, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.1)" }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer relative"
                        >
                          <div className="relative h-56 bg-gray-100">
                            <Image
                              src={product.image || '/placeholder.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              priority={index < 4}
                            />
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {product.benefits && product.benefits.slice(0, 2).map((benefit, benefitIndex) => (
                                <span key={benefitIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {benefit}
                                </span>
                              ))}
                              {product.benefits && product.benefits.length > 2 && (
                                <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                                  +{product.benefits.length - 2} {t('more')}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleProductClick(product)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                            >
                              {t('View Details')}
                            </button>
                            {isAdmin && (
                              <div className="flex justify-between mt-4 space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingProduct(product);
                                  }}
                                  className="flex-1 flex items-center justify-center py-2 px-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all text-sm"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 013.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                  {t('Edit')}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProduct(product.id);
                                  }}
                                  className="flex-1 flex items-center justify-center py-2 px-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all text-sm"
                                >
                                  <Image
                                    src="/trash.png"
                                    alt="trash"
                                    width={20}
                                    height={20}
                                    className="mr-2"
                                  />
                                  {t('Delete')}
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </FadeInWhenVisible>
                    ))}
                  </div>
                ) : (
                  <FadeInWhenVisible>
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noProductsFound')}</h3>
                      <p className="text-gray-600">{t('tryAdjustingSearch')}</p>
                    </div>
                  </FadeInWhenVisible>
                )}
              </div>
            </section>
            {isAdmin && (
              <section className="py-20 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">{t('categoryManagement')}</h2>
                    <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('newCategory')}
                        </label>
                        <input
                          type="text"
                          id="newCategory"
                          className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                          placeholder={t('newCategory')}
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                        >
                          {t('addCategory')}
                        </button>
                      </div>
                    </form>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {categories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="text-gray-800 capitalize">{t(category)}</span>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
            <section id="about" className="py-20 bg-white">
              <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="lg:w-1/2">
                    <FadeInWhenVisible>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        {t('aboutTitle')}
                      </h2>
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.1}>
                      <p className="text-lg text-gray-600 mb-6">
                        {t('aboutDescription')}
                      </p>
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.2}>
                      <p className="text-lg text-gray-600 mb-8">
                        {t('aboutDescription2')}
                      </p>
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.3}>
                      <div className="space-y-4">
                        {[
                          t('Rigorous quality control at every production stage'),
                          t('Clinically proven ingredients at effective dosages'),
                          t('Transparent sourcing and manufacturing processes'),
                          t('Trusted by healthcare professionals worldwide')
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-start"
                          >
                            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-4 mt-1">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <p className="text-gray-700">{item}</p>
                          </motion.div>
                        ))}
                      </div>
                    </FadeInWhenVisible>
                  </div>
                  <div className="lg:w-1/2 w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      viewport={{ once: true }}
                      className="relative w-full h-96 rounded-xl overflow-hidden shadow-xl"
                    >
                      <div className="lg:hidden relative w-full h-full">
                        <Image
                          src={aboutImageText.image || '/logo.jpg'}
                          alt={t('About Us Image')}
                          fill
                          className="object-cover"
                          priority
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                        ></motion.div>
                        <motion.div
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="absolute bottom-0 left-0 right-0 p-6 text-white"
                        >
                          <h3 className="text-xl font-semibold mb-2">{aboutImageText.title}</h3>
                          <p className="text-lg">{aboutImageText.subtitle}</p>
                          <p className="text-sm mt-4">{aboutImageText.description}</p>
                        </motion.div>
                      </div>
                      <div className="hidden lg:block relative w-full h-full">
                        <Image
                          src={aboutImageText.image || '/logo.jpg'}
                          alt={t('About Us Image')}
                          fill
                          className="object-cover"
                          priority
                          sizes="50vw"
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"
                        ></motion.div>
                        <motion.div
                          initial={{ y: 50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="absolute bottom-0 left-0 right-0 p-6 text-white"
                        >
                          <h3 className="text-2xl font-semibold mb-2">{aboutImageText.title}</h3>
                          <p className="text-lg">{aboutImageText.subtitle}</p>
                          <p className="text-sm mt-4">{aboutImageText.description}</p>
                        </motion.div>
                      </div>
                      {isAdmin && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                          className="absolute top-4 right-4"
                        >
                          <button
                            onClick={() => setEditingAboutText(true)}
                            className="px-3 py-1 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 013.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            {t('edit')}
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>
            <section id="science" className="py-20 bg-gray-50">
              <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                  <FadeInWhenVisible>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      {t('The Science Behind Our Products')}
                    </h2>
                  </FadeInWhenVisible>
                  <FadeInWhenVisible delay={0.1}>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      {t('Our supplements are developed based on the latest scientific research and formulated by medical experts to ensure efficacy and safety.')}
                    </p>
                  </FadeInWhenVisible>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  {[
                    {
                      icon: (
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      ),
                      title: t('evidenceBasedFormulations'),
                      description: t('evidenceBasedDescription')
                    },
                    {
                      icon: (
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      ),
                      title: t('qualityAssurance'),
                      description: t('qualityAssuranceDescription')
                    },
                    {
                      icon: (
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ),
                      title: t('optimalBioavailability'),
                      description: t('optimalBioavailabilityDescription')
                    }
                  ].map((item, index) => (
                    <FadeInWhenVisible key={index} delay={index * 0.1}>
                      <motion.div
                        whileHover={{ y: -5, boxShadow: "0 10px 20px -5px rgba(59, 130, 246, 0.2)" }}
                        className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                          {item.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{item.title}</h3>
                        <p className="text-gray-600 text-center">{item.description}</p>
                      </motion.div>
                    </FadeInWhenVisible>
                  ))}
                </div>
              </div>
            </section>
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <div className="container mx-auto px-4 md:px-6 text-center">
                <FadeInWhenVisible>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    {t('readyToExperience')}
                  </h2>
                </FadeInWhenVisible>
                <FadeInWhenVisible delay={0.1}>
                  <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                    {t('joinThousands')}
                  </p>
                </FadeInWhenVisible>
                <FadeInWhenVisible delay={0.2}>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => scrollToSection('products')}
                      className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      {t('shopNow')}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => scrollToSection('contact')}
                      className="border-2 border-white text-white hover:bg-white hover:bg-opacity-10 font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.57 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {t('speakToExpert')}
                    </motion.button>
                  </div>
                </FadeInWhenVisible>
              </div>
            </section>
            <section id="contact" className="py-20 bg-white">
              <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                  <FadeInWhenVisible>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      {t('contactTitle')}
                    </h2>
                  </FadeInWhenVisible>
                  <FadeInWhenVisible delay={0.1}>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      {t('contactDescription')}
                    </p>
                  </FadeInWhenVisible>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="lg:order-2">
                    <ContactOptions t={t} />
                  </div>
                  <div className="lg:order-1">
                    <FadeInWhenVisible>
                      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center lg:text-left">
                        {t('Our Location')}
                      </h3>
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.1}>
                      <p className="text-gray-600 mb-4 text-center lg:text-left">
                        {t('Find us on the map')}
                      </p>
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.2}>
                      <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-lg">
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d993.2819834780371!2d45.447408248217236!3d35.55673195195493!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2siq!4v1750359654725!5m2!1sen!2siq"
                          width="100%"
                          height="100%"
                          style={{ border: 0, borderRadius: '0.75rem' }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="rounded-xl"
                        ></iframe>
                      </div>
                    </FadeInWhenVisible>
                  </div>
                </div>
              </div>
            </section>
            <footer className="bg-gray-900 text-white pt-16 pb-8">
              <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                  <div>
                    <FadeInWhenVisible>
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6">
                        {t('Sardeli')}
                      </div>
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.1}>
                      <p className="text-gray-400 mb-6">
                        {t('footerDescription')}
                      </p>
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.2}>
                      <div className="flex space-x-4">
                        {[
                          { href: "#", icon: "facebook" },
                          { href: "#", icon: "twitter" },
                          { href: "#", icon: "linkedin" },
                          { href: "#", icon: "instagram" }
                        ].map((item, index) => (
                          <motion.a
                            key={index}
                            href={item.href}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-400 hover:text-white transition"
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              {item.icon === "facebook" && (
                                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                              )}
                              {item.icon === "twitter" && (
                                <path d="M22.46 4.02c-.78-.39-1.61-.39-2.39 0 .77.4 1.38 1.17 1.64 2.04-.84-.05-1.69-.1-2.56-.1-1.83 0-3.32 1.49-3.32 3.32 0 .38.02.75.05 1.12A10.55 10.55 0 008.54 4.27c-.68-.47-1.4-.8-2.15-1.02C4.65 3.96 3.01 5.5 3.01 7.73 0 1.54.87 2.94 2.24 3.72-.37.1-.8.14-1.27.14-.78 0-1.6-.2-2.48-.54-2.48-1.6 0 1.5-.97 2.82-2.3 3.8-3.79 3.8-1.47.84-2.78 1.85-3.84 3.02 0 0 0 1.82-.55 3.52-1.48 1.7-1.7 3.58-1.7 5.3 0 1.1.6 2.08 1.48 2.74 2.14-.92 4.78-1.53 7.54-1.53.55 0 1.05.1 1.5.28.92-.68 1.38-1.74 1.38-3.12 0-.28-.03-.55-.08-.75-.78-.8-1.7-1.25-2.75-1.25-.85 0-1.65.2-2.4.55-.55.28-1.05.4-1.5.4z" />
                              )}
                              {item.icon === "linkedin" && (
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764 1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              )}
                              {item.icon === "instagram" && (
                                <path d="M12.315 1.5a3.5 3.5 0 00-4.63 0 3.5 3.5 0 003.5 3.5 3.5 3.5 0 003.5-3.5 3.5 3.5 0 00-3.5-3.5zm7 7a7 7 0 00-7-7 7 7 0 00-7 7 7 7 0 007 7zm7-13.5a3.5 3.5 0 10-7 0 3.5 3.5 0 107 0z" />
                              )}
                            </svg>
                          </motion.a>
                        ))}
                      </div>
                    </FadeInWhenVisible>
                  </div>
                  <div>
                    <FadeInWhenVisible>
                      <h3 className="text-lg font-semibold mb-6 text-white">{t('products')}</h3>
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.1}>
                      <ul className="space-y-3">
                        {categories.map((category, index) => (
                          <li key={index}>
                            <motion.a
                              href={`#${category}`}
                              whileHover={{ x: 5 }}
                              className="text-gray-400 hover:text-white transition-all duration-200 inline-block"
                            >
                              {t(category)}
                            </motion.a>
                          </li>
                        ))}
                      </ul>
                    </FadeInWhenVisible>
                  </div>
                  <div>
                    <FadeInWhenVisible>
                      <h3 className="text-lg font-semibold mb-6 text-white">{t('company')}</h3>
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.1}>
                      <ul className="space-y-3">
                        {[
                          { name: "about", href: "#about" },
                          { name: "science", href: "#science" },
                          { name: "qualityStandards", href: "#" },
                          { name: "press", href: "#" },
                          { name: "careers", href: "#" }
                        ].map((item, index) => (
                          <li key={index}>
                            <motion.a
                              href={item.href}
                              whileHover={{ x: 5 }}
                              className="text-gray-400 hover:text-white transition-all duration-200 inline-block"
                            >
                              {t(item.name)}
                            </motion.a>
                          </li>
                        ))}
                      </ul>
                    </FadeInWhenVisible>
                  </div>
                  <div>
                    <FadeInWhenVisible>
                      <h3 className="text-lg font-semibold mb-6 text-white">{t('resources')}</h3>
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.1}>
                      <ul className="space-y-3">
                        {[
                          { name: "blog", href: "#" },
                          { name: "research", href: "#" },
                          { name: "faq", href: "#" },
                          { name: "shippingReturns", href: "#" },
                          { name: "contactUs", href: "#contact" }
                        ].map((item, index) => (
                          <li key={index}>
                            <motion.a
                              href={item.href}
                              whileHover={{ x: 5 }}
                              className="text-gray-400 hover:text-white transition-all duration-200 inline-block"
                            >
                              {t(item.name)}
                            </motion.a>
                          </li>
                        ))}
                      </ul>
                    </FadeInWhenVisible>
                  </div>
                </div>
                <div className="border-t border-gray-800 pt-8">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <FadeInWhenVisible>
                      <p className="text-gray-400 text-sm">
                        {t('copyright').replace('{year}', new Date().getFullYear())}
                      </p>
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.1}>
                      <div className="flex flex-wrap justify-center gap-4">
                        {[
                          { name: "privacyPolicy", href: "#" },
                          { name: "termsOfService", href: "#" },
                          { name: "sitemap", href: "#" }
                        ].map((item, index) => (
                          <motion.a
                            key={index}
                            href={item.href}
                            whileHover={{ y: -2 }}
                            className="text-gray-400 hover:text-white text-sm transition-all duration-200 inline-block"
                          >
                            {t(item.name)}
                          </motion.a>
                        ))}
                      </div>
                    </FadeInWhenVisible>
                  </div>
                </div>
              </div>
            </footer>
            <AnimatePresence>
              {editingProduct !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
                  onClick={() => setEditingProduct(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-white rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                  >
                    <ProductForm
                      product={editingProduct}
                      onSave={handleSaveProduct}
                      onCancel={() => setEditingProduct(null)}
                      categories={categories}
                      t={t}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {editingAboutText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
                  onClick={() => setEditingAboutText(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-white rounded-xl overflow-hidden max-w-2xl w-full"
                    onClick={e => e.stopPropagation()}
                  >
                    <AboutImageTextEditor
                      aboutImage={aboutImageText.image}
                      aboutImageText={aboutImageText}
                      onSave={handleSaveAboutText}
                      onCancel={() => setEditingAboutText(false)}
                      t={t}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isModalOpen && selectedProduct && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
                  onClick={handleOverlayClick}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-white rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/2 p-6 bg-gray-50">
                        <div className="relative h-64 md:h-full min-h-[300px]">
                          <Image
                            src={selectedProduct.image || '/placeholder.jpg'}
                            alt={selectedProduct.name}
                            fill
                            className="object-contain"
                            priority
                          />
                        </div>
                      </div>
                      <div className="md:w-1/2 p-6 overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                          <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700 transition"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </motion.button>
                        </div>
                        <div className="mb-6">
                          <h3 className="font-semibold text-lg text-gray-800 mb-2">{t('description')}</h3>
                          <p className="text-gray-600">{selectedProduct.description}</p>
                        </div>
                        <div className="mb-6">
                          <h3 className="font-semibold text-lg text-gray-800 mb-3">{t('keyBenefits')}</h3>
                          <ul className="space-y-2">
                            {selectedProduct.benefits && selectedProduct.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start">
                                <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-gray-700">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mb-6">
                          <h3 className="font-semibold text-lg text-gray-800 mb-2">{t('size')}</h3>
                          <p className="text-gray-700 font-medium">{selectedProduct.size}</p>
                        </div>
                        <div className="mb-6">
                          <h3 className="font-semibold text-lg text-gray-800 mb-3">{t('activeIngredients')}</h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <ul className="space-y-2">
                              {selectedProduct.ingredients && selectedProduct.ingredients.map((ingredient, index) => (
                                <li key={index} className="flex justify-between border-b border-gray-200 py-2">
                                  <span className="text-gray-700">{ingredient.split('(')[0].trim()}</span>
                                  <span className="text-gray-500 font-medium">{ingredient.match(/\((.*?)\)/)?.[1] || ''}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </LanguageContext.Provider>
      </AdminContext.Provider>
    </ErrorBoundary>
  );
}
