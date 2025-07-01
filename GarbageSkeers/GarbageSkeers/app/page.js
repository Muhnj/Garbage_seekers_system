'use client';
import { useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Image from 'next/image';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const stepsRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Initialize GSAP animations
    const initAnimations = () => {
      // Header animation
      gsap.from('.logo', {
        duration: 1,
        opacity: 0,
        y: -20,
        ease: "power3.out"
      });
      
      gsap.from('.nav-button', {
        duration: 0.8,
        opacity: 0,
        y: -20,
        stagger: 0.2,
        delay: 0.3,
        ease: "power3.out"
      });

      // Hero section animation
      gsap.from('.hero-title', {
        duration: 1.2,
        opacity: 0,
        y: 40,
        stagger: 0.2,
        delay: 0.4,
        ease: "power3.out"
      });
      
      gsap.from('.hero-subtitle', {
        duration: 1,
        opacity: 0,
        delay: 0.8,
        ease: "power3.out"
      });
      
      gsap.from('.hero-button', {
        duration: 0.8,
        opacity: 0,
        y: 30,
        stagger: 0.2,
        delay: 1,
        ease: "power3.out"
      });

      // Steps section animation
      gsap.from('.step-card', {
        duration: 1,
        opacity: 0,
        y: 50,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.steps-section',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        ease: "power3.out"
      });

      // Features animation
      gsap.from('.feature-card', {
        duration: 1,
        opacity: 0,
        y: 50,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        ease: "power3.out"
      });

      // Testimonials animation
      gsap.from('.testimonial-card', {
        duration: 1,
        opacity: 0,
        y: 50,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.testimonials-section',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        ease: "power3.out"
      });

      // CTA animation
      gsap.from('.cta-section', {
        duration: 1.2,
        opacity: 0,
        y: 50,
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        ease: "power3.out"
      });

      // Floating animation for cards
      gsap.to('.floating', {
        y: 15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    };

    // Video play on scroll
    const handleScroll = () => {
      if (videoRef.current) {
        const video = videoRef.current;
        const videoPosition = video.getBoundingClientRect();
        
        if (videoPosition.top < window.innerHeight && videoPosition.bottom > 0) {
          video.play().catch(error => console.log("Video autoplay prevented:", error));
        } else {
          video.pause();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    initAnimations();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      <Head>
        <title>Garbage Seekers | Modern Waste Management</title>
        <meta name="description" content="Efficient waste collection system for cleaner communities. Schedule pickups in minutes." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative min-h-screen overflow-hidden font-sans bg-gradient-to-br from-[#0a3d62] to-[#1e5799]">
        {/* Video Background with Overlay */}
        <div className="fixed top-0 left-0 w-full h-full -z-10">
          <Image width={5000} height={4000} src={'/clean.jpg'} alt="" />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a3d62]/70 to-[#0a3d62]"></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: `${Math.random() * 20 + 5}px`,
                height: `${Math.random() * 20 + 5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `pulse ${Math.random() * 8 + 4}s infinite ease-in-out`
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-6 sm:px-6 z-10">
          {/* Header */}
          <header className="flex justify-between items-center py-8">
            <div className="flex items-center logo">
              <div className="bg-white rounded-full p-2 mr-3">
                <Image width={50} height={50} src={'/icon.png'} alt="" />
              </div>
              <div className="text-2xl font-bold text-white">
                Garbage<span className="text-emerald-400">Seekers</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link
                href="/auth/signin"
                className="nav-button border-2 border-emerald-400 text-emerald-400 px-4 py-2 rounded-md font-semibold hover:bg-emerald-400/10 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="nav-button bg-emerald-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30"
              >
                Download Application.
              </Link>
            </div>
          </header>

          {/* Hero Section */}
          <section className="py-16 md:py-24 text-center max-w-4xl mx-auto">
            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="block">Transform Waste Management</span>
              <span className="block text-emerald-400 mt-2">For Cleaner Communities</span>
            </h1>
            <p className="hero-subtitle text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Book garbage pickup in seconds with our advanced platform. Join the movement for a cleaner, greener future.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="hero-button bg-emerald-500 text-white py-3 px-8 rounded-full text-lg font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30"
              >
                Get Started Now
              </Link>
              <Link
                href="/services"
                className="hero-button bg-white/10 backdrop-blur-md border border-white/20 text-white py-3 px-8 rounded-full text-lg font-bold hover:bg-white/20 transition-colors"
              >
                How It Works
              </Link>
            </div>
          </section>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { value: "15K+", label: "Happy Customers" },
              { value: "98%", label: "On-Time Pickups" },
              { value: "500+", label: "Tons Recycled" },
              { value: "25+", label: "Cities Covered" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-md p-6 rounded-xl text-center floating"
              >
                <div className="text-3xl font-bold text-emerald-400 mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* How It Works Section */}
          <section className="steps-section py-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
              <div className="w-24 h-1 bg-emerald-400 mx-auto rounded-full"></div>
              <p className="text-white/80 mt-6 max-w-2xl mx-auto">
                Our simple 3-step process makes waste disposal effortless and efficient
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                { 
                  icon: "fas fa-download", 
                  title: "Download the App", 
                  desc: "Register in less than 2 minutes to get started",
                  link: "/auth/signin"
                },
                { 
                  icon: "fas fa-calendar-alt", 
                  title: "Schedule Pickup", 
                  desc: "Choose date, time and location for waste collection",
                  link: "#"
                },
                { 
                  icon: "fas fa-money-bill-wave", 
                  title: "Secure Payment", 
                  desc: "Pay conveniently with cash after service delivery",
                  link: "#"
                }
              ].map((step, index) => (
                <Link
                  key={index}
                  href={step.link}
                  className="step-card floating flex flex-col items-center p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:border-emerald-400/30 transition-all duration-300 group"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl mb-6 group-hover:bg-emerald-600 transition-colors">
                    <i className={step.icon}></i>
                  </div>
                  <div className="text-xl font-bold text-white mb-3">{step.title}</div>
                  <p className="text-white/80 text-center">
                    {step.desc}
                  </p>
                  <div className="mt-6 text-emerald-400 hover:text-emerald-300 flex items-center">
                    Learn More <i className="fas fa-arrow-right ml-2 text-sm"></i>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section py-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Us</h2>
              <div className="w-24 h-1 bg-emerald-400 mx-auto rounded-full"></div>
              <p className="text-white/80 mt-6 max-w-2xl mx-auto">
                We provide the most efficient and reliable waste management services
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                { icon: "fas fa-clock", title: "On-Time Pickups", desc: "98% of our pickups are completed within the scheduled window" },
                { icon: "fas fa-recycle", title: "Eco-Friendly", desc: "We recycle over 80% of collected waste responsibly" },
                { icon: "fas fa-shield-alt", title: "Secure Payments", desc: "All transactions are encrypted and secure" },
                { icon: "fas fa-headset", title: "24/7 Support", desc: "Our customer service team is always available" },
                { icon: "fas fa-map-marker-alt", title: "Wide Coverage", desc: "Serving residential and commercial areas" },
                { icon: "fas fa-chart-line", title: "Real-Time Tracking", desc: "Track your pickup crew in real-time" },
                { icon: "fas fa-leaf", title: "Green Initiatives", desc: "Supporting environmental sustainability programs" },
                { icon: "fas fa-trophy", title: "Award Winning", desc: "Recognized as top waste management service" }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="feature-card floating bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-emerald-400/30 transition-colors"
                >
                  <div className="text-emerald-400 text-2xl mb-4">
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/80">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="testimonials-section py-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Customers Say</h2>
              <div className="w-24 h-1 bg-emerald-400 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  name: "Sarah Johnson", 
                  role: "Homeowner",
                  comment: "Garbage Seekers has transformed how we manage waste. The app is easy to use and their service is always punctual.",
                  stars: 5
                },
                { 
                  name: "Michael Chen", 
                  role: "Restaurant Owner",
                  comment: "As a business owner, reliable waste disposal is crucial. Garbage Seekers has never let us down. Highly recommend!",
                  stars: 5
                },
                { 
                  name: "Emma Rodriguez", 
                  role: "Property Manager",
                  comment: "The convenience of scheduling pickups through the app is fantastic. Plus, I love knowing our waste is handled responsibly.",
                  stars: 4.5
                }
              ].map((testimonial, index) => (
                <div 
                  key={index}
                  className="testimonial-card floating bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 hover:border-emerald-400/30 transition-colors"
                >
                  <div className="flex items-center mb-6">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                    <div className="ml-4">
                      <h4 className="text-white font-bold">{testimonial.name}</h4>
                      <p className="text-white/70 text-sm">{testimonial.role}</p>
                      <div className="flex text-amber-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i}
                            className={`fas ${i < Math.floor(testimonial.stars) ? 'fa-star' : (i === Math.floor(testimonial.stars) && testimonial.stars % 1 !== 0 ? 'fa-star-half-alt' : 'fa-star')}`}
                          ></i>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-white/90 italic">
                    "{testimonial.comment}"
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section ref={ctaRef} className="cta-section py-16 text-center">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl p-12 floating">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
              <p className="text-white/90 mb-10 max-w-2xl mx-auto">
                Join thousands of satisfied customers who are making their communities cleaner and greener.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/register"
                  className="bg-white text-emerald-600 py-3 px-8 rounded-full text-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  Download Application
                </Link>
                <Link
                  href="/contact"
                  className="bg-transparent border-2 border-white text-white py-3 px-8 rounded-full text-lg font-bold hover:bg-white/10 transition-colors"
                >
                  Contact Service Center
                </Link>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-white rounded-full p-1 mr-3">
                    <Image width={50} height={50} src={'/icon.png'} alt="" />
                  </div>
                  <div className="text-xl font-bold text-white">
                    Garbage<span className="text-emerald-400">Seekers</span>
                  </div>
                </div>
                <p className="text-white/80 mb-4">
                  Making waste management efficient, reliable, and environmentally responsible.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-white/70 hover:text-emerald-400 transition-colors">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="text-white/70 hover:text-emerald-400 transition-colors">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="text-white/70 hover:text-emerald-400 transition-colors">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="text-white/70 hover:text-emerald-400 transition-colors">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-white/80 hover:text-emerald-400 transition-colors">About Us</Link></li>
                  <li><Link href="/services" className="text-white/80 hover:text-emerald-400 transition-colors">Services</Link></li>
                  <li><Link href="/pricing" className="text-white/80 hover:text-emerald-400 transition-colors">Pricing</Link></li>
                  <li><Link href="/blog" className="text-white/80 hover:text-emerald-400 transition-colors">Blog</Link></li>
                  <li><Link href="/careers" className="text-white/80 hover:text-emerald-400 transition-colors">Careers</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><Link href="/contact" className="text-white/80 hover:text-emerald-400 transition-colors">Contact Us</Link></li>
                  <li><Link href="/faq" className="text-white/80 hover:text-emerald-400 transition-colors">FAQ</Link></li>
                  <li><Link href="/help-center" className="text-white/80 hover:text-emerald-400 transition-colors">Help Center</Link></li>
                  <li><Link href="/terms" className="text-white/80 hover:text-emerald-400 transition-colors">Terms</Link></li>
                  <li><Link href="/privacy" className="text-white/80 hover:text-emerald-400 transition-colors">Privacy</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-start">
                    <i className="fas fa-map-marker-alt text-emerald-400 mt-1 mr-3"></i>
                    <span>123 Green Street, Eco City, EC 10101</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-phone text-emerald-400 mr-3"></i>
                    <span>+1 (555) 123-4567</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-envelope text-emerald-400 mr-3"></i>
                    <span>info@garbageseekers.com</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/10 text-center text-white/60">
              <p>&copy; 2025 Garbage Seekers. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        .floating {
          transition: transform 0.3s ease;
        }
        
        .floating:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </>
  );
}