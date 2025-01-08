import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-dark-200 border-t border-primary-800/20 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-lg font-cyber text-white mb-2">Developed by Sudhanshu and Kapish</h3>
            <p className="text-gray-400 text-sm">
              A sci-fi social media platform for the future
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/sudhaanshuu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Github size={24} />
            </a>
            <a
              href="https://twitter.com/sudhan_shuu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Twitter size={24} />
            </a>
          </div>
        </div>
        
        
      </div>
    </footer>
  );
}