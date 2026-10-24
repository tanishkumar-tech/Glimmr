import { useState } from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Us',
      info: 'support@glimmr.com',
      description: 'We respond within 24 hours',
    },
    {
      icon: '📞',
      title: 'Call Us',
      info: '+91 1800-GLIMMR',
      description: 'Mon-Sat, 9 AM - 7 PM IST',
    },
    {
      icon: '📍',
      title: 'Visit Us',
      info: 'Mumbai, Maharashtra',
      description: 'Flagship showroom available',
    },
    {
      icon: '💬',
      title: 'Live Chat',
      info: 'Chat with our team',
      description: 'Available during business hours',
    },
  ];

  const faqs = [
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy on all unworn items in original packaging.',
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Currently, we ship within India. International shipping coming soon!',
    },
    {
      question: 'Are your diamonds certified?',
      answer: 'Yes, all our diamonds come with certification from recognized gemological institutes.',
    },
    {
      question: 'Can I customize my jewelry?',
      answer: 'Absolutely! We offer bespoke jewelry services. Contact us to discuss your requirements.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-4">
            📬 Get In Touch
          </h1>
          <p className="text-gray-600 text-lg">
            We'd love to hear from you! Reach out with any questions or feedback
          </p>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100 text-center"
            >
              <div className="text-5xl mb-3">{method.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{method.title}</h3>
              <p className="text-indigo-600 font-semibold mb-1">{method.info}</p>
              <p className="text-gray-500 text-sm">{method.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact Form & Map */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
            {submitted ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Message Sent!</h3>
                <p className="text-gray-600">We'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Send Message
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Info & Hours */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Business Hours */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
              <h2 className="text-3xl font-bold mb-6">⏰ Business Hours</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Monday - Friday:</span>
                  <span>9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Saturday:</span>
                  <span>10:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Sunday:</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🏢 Our Location</h2>
              <p className="text-gray-700 mb-4">
                <strong>Glimmr Jewelry Flagship Store</strong><br />
                123 Jewelry District<br />
                Mumbai, Maharashtra 400001<br />
                India
              </p>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 text-center">
                <p className="text-5xl mb-2">🗺️</p>
                <p className="text-gray-600 text-sm">Visit our beautiful showroom to experience our collection in person</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-12">
            ❓ Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Follow Us on Social Media</h2>
          <p className="text-gray-600 mb-8">Stay updated with our latest collections and exclusive offers</p>
          <div className="flex justify-center gap-6">
            {['Instagram', 'Facebook', 'Pinterest', 'Twitter'].map((social, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg hover:shadow-xl transition-all"
              >
                {social[0]}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
