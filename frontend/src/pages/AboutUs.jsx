import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  const values = [
    {
      icon: '💎',
      title: 'Quality Craftsmanship',
      description: 'Each piece is meticulously handcrafted by skilled artisans with decades of experience',
    },
    {
      icon: '✨',
      title: 'Timeless Elegance',
      description: 'We create jewelry that transcends trends, designed to be treasured for generations',
    },
    {
      icon: '🤝',
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We offer personalized service and lifetime support',
    },
    {
      icon: '🌍',
      title: 'Sustainable Practices',
      description: 'We source ethically and work towards environmentally responsible jewelry making',
    },
  ];

  const timeline = [
    { year: '2015', event: 'Glimmr was founded with a vision to revolutionize luxury jewelry' },
    { year: '2017', event: 'Opened our first flagship store in Mumbai' },
    { year: '2019', event: 'Launched online platform, reaching customers nationwide' },
    { year: '2021', event: 'Expanded collection to include bespoke wedding jewelry' },
    { year: '2023', event: 'Won "Best Jewelry Brand" award for innovation and design' },
    { year: '2025', event: 'Serving over 100,000 happy customers with AI-powered recommendations' },
  ];

  const team = [
    {
      name: 'Ayush Soni',
      role: 'Founder & Creative Director',
      image: '👩‍💼',
      description: 'Visionary designer with 20+ years in luxury jewelry',
    },
    {
      name: 'Ruhael Singh',
      role: 'Master Craftsman',
      image: '👨‍🔧',
      description: 'Third-generation jeweler specializing in traditional techniques',
    },
    {
      name: 'Tanish Kumar',
      role: 'Head of Customer Experience',
      image: '👩‍💻',
      description: 'Dedicated to creating memorable customer journeys',
    },
    {
      name: 'Mahikshit Choudhary',
      role: 'Chief Technology Officer',
      image: '👨‍💻',
      description: 'Leading digital innovation in jewelry retail',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-96 bg-gradient-to-r from-primary via-amber-600 to-rose-600 overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/30" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-bold mb-4"
          >
            About Glimmr
          </motion.h1>
          <motion.p
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl max-w-2xl"
          >
            Where Timeless Elegance Meets Modern Innovation
          </motion.p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-16">
        {/* Our Story */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600 mb-6">
              Our Story
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Founded in 2015, Glimmr was born from a passion for creating jewelry that tells a story. 
              We believe that every piece of jewelry should be more than just an accessory—it should be 
              a cherished memory, a symbol of love, and a work of art.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              What started as a small workshop in Mumbai has grown into India's leading online jewelry 
              destination, serving over 100,000 customers nationwide. We combine traditional craftsmanship 
              with cutting-edge technology to bring you the finest jewelry experience.
            </p>
          </div>
        </motion.section>

        {/* Our Values */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600 mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-white rounded-2xl p-8 shadow-xl border border-amber-100 text-center"
              >
                <div className="text-6xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600 mb-12">
            Our Journey
          </h2>
          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 mb-8"
              >
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {item.year}
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-amber-100">
                  <p className="text-gray-700">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Our Team */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-600 mb-12">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl border border-amber-100"
              >
                <div className="bg-gradient-to-br from-amber-100 to-rose-100 h-48 flex items-center justify-center text-8xl">
                  {member.image}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                  <p className="text-primary font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="bg-gradient-to-r from-primary to-amber-600 rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-4xl font-bold text-center mb-12">Glimmr by Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="text-5xl font-bold mb-2"
                >
                  100K+
                </motion.div>
                <p className="text-amber-100">Happy Customers</p>
              </div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl font-bold mb-2"
                >
                  5000+
                </motion.div>
                <p className="text-amber-100">Unique Designs</p>
              </div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-bold mb-2"
                >
                  10+
                </motion.div>
                <p className="text-amber-100">Years of Excellence</p>
              </div>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl font-bold mb-2"
                >
                  50+
                </motion.div>
                <p className="text-amber-100">Expert Craftsmen</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Ready to Find Your Perfect Piece?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our stunning collection of handcrafted jewelry, each piece telling its own unique story
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary to-amber-600 text-white rounded-full font-semibold shadow-lg"
              >
                Shop Collection
              </motion.button>
            </Link>
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                Contact Us
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AboutUs;
