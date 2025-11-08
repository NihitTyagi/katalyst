import { Link } from 'react-router-dom'
import { TrendingUp, Users, DollarSign, Award } from 'lucide-react'

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-dark mb-6">
            MT- Web Services
            <br />
            <span className="text-primary">Digital Solutions That Scale</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            We turn your ideas into powerful, high performing digital products.
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            From custom software to AI-powered solutions, MT builds scalable innovations designed for impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary">
              Start Your Project
            </Link>
            <Link to="/leaderboard" className="btn-secondary">
              Explore Our Work
            </Link>
          </div>
        </div>
      </section>

      {/* Why Trust Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Why trust <span className="text-primary">MT</span> to
          </h2>
          <h3 className="text-4xl font-bold text-center mb-16">
            <span className="text-primary">Supercharge</span> your business?
          </h3>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Innovation</h4>
                  <p className="text-gray-600">
                    We explore new technologies and tools. To provide new unique and cutting-edge solutions that set our clients apart in the digital landscape.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Human-Centered Design</h4>
                  <p className="text-gray-600">
                    We focus on understanding and meeting user needs at every stage. By creating intuitive and engaging experiences, we ensure results are not only aesthetically pleasing but also highly functional and user-friendly.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Quality</h4>
                  <p className="text-gray-600">
                    We are committed to excellence, adhering to the highest standards of quality and performance. Using advanced technologies and approaches, we ensure every project exceeds our clients' expectations.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Collaboration</h4>
                  <p className="text-gray-600">
                    As a small, close-knit team, we have worked together for years, developing a deep understanding of each other's strengths and fostering strong teamwork.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
                <h3 className="text-3xl font-bold mb-4">Join Our Affiliate Program</h3>
                <p className="text-gray-600 mb-6">
                  Refer clients to MT and earn generous rewards on every successful project.
                </p>
                <Link to="/signup" className="btn-primary inline-block">
                  Become an Affiliate
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            How <span className="text-primary">Katalyst</span> Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your affiliate account and get your unique referral code
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Refer Clients</h3>
              <p className="text-gray-600">
                Share your referral link and submit potential client details
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Reward</h3>
              <p className="text-gray-600">
                Get paid when your referral becomes a paying client
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your leads, earnings, and performance in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join Katalyst today and become part of our growing affiliate community
          </p>
          <Link to="/signup" className="btn-primary text-lg">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
