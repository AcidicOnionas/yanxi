import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface BlogPostParams {
  params: {
    slug: string
  }
}

export default function BlogPost({ params }: BlogPostParams) {
  const { slug } = params;
  interface PostData {
    title: string;
    date: string;
    author: string;
    image: string;
    content: string;
  }
  // Define a mapping of slugs to post data
  const postsData: Record<string, PostData> = {
    "n0s4n1ty-1": {
      title: "n0s4n1ty 1",
      date: "April 1, 2025",
      author: "Chris Cao",
      image: "/NoSanityWriteup/NoSanity.png?height=900&width=1200",
      content: `
        <p>A pretty fun challenge, as with any picoCTF challenge, look at the hints</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
        <img src="/NoSanityWriteup/Hint1.png" alt="First image" style="width: 80%; height: auto; border-radius: 8px;" />
        <img src="/NoSanityWriteup/Hint2.png" alt="Second image" style="width: 80%; height: auto; border-radius: 8px;" />
        </div>
        <p>Now lets start the instance and open the webpage. Once you open the website provided to you by the instance, you get something like this.</p>
        <img 
        src="/NoSanityWriteup/Step1.png" 
        alt="Webpage" 
        class="w-full rounded-lg my-6"
        />
        <p>As with any challenge that involves inputs, we first upload something to test</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
        <img src="/NoSanityWriteup/Uploading.png" alt="First image" style="width: 80%; height: auto; border-radius: 8px;" />
        <img src="/NoSanityWriteup/result.png" alt="Second image" style="width: 80%; height: auto; border-radius: 8px;" />
        </div>
        <p>As we can see, the file gets directly inputted into the server's files, and as
        hint 1 above mentioned, the inputs are not sanitized, this means that any file we 
        upload gets directly put into the server files. This means that we can upload files
        such as php files with a script that would enable RCE (remote code execution)</p>
        <p>Let's create such a PHP file (Note: the php file will likely get flagged by 
        Microsoft Defender if you are on windows, so be quick with the uploading.</p>
        <img 
        src="/NoSanityWriteup/phpfile.png" 
        alt="Webpage" 
        class="w-full rounded-lg my-6"
        />
        <p>Save the file as shell.php, now we upload it onto the website</p>
        <img 
        src="/NoSanityWriteup/uploadedshell.png" 
        alt="Webpage" 
        class="w-full rounded-lg my-6"
        />
        <p>We can see that the file is now in uploads/shell.php, so now lets change the url to go to the file and run a command by adding ?cmd= at the end of the url (?cmd allows you to set the cmd variable in the php file)</p>
        <img 
        src="/NoSanityWriteup/lsr.png" 
        alt="Webpage" 
        class="w-full rounded-lg my-6"
        />
        <p>Hurray! We now have RCE. Now we do as hint 2 says and run sudo -l</p> 
        <img 
        src="/NoSanityWriteup/sudo-l.png" 
        alt="Webpage" 
        class="w-full rounded-lg my-6"
        />
        <p>As we can see, we can run any sudo command without password, and since we already know that the flag is in root, we can sudo cat into the flag</p>
        <img 
        src="/NoSanityWriteup/flag.png" 
        alt="Webpage" 
        class="w-full rounded-lg my-6"
        />
        <p>Challenge Solved</p>
      `,
    },
    "intro": {
      title: "Hello",
      date: "March 22, 2025",
      author: "Chris Cao",
      image: "/placeholder.svg?height=600&width=1200",
      content: `
        <p>Hello, this is my personal blog page,</p>
      `,
    },
    // Add more posts as needed
  };
  
  // Get the post data for the current slug
  const post = postsData[slug] || {
    title: "Post Not Found",
    date: "Unknown Date",
    author: "Unknown Author",
    image: "/placeholder.svg?height=600&width=1200",
    content: "<p>Sorry, this post could not be found.</p>",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <article className="container max-w-3xl px-4 py-12 md:py-20">
          <Button variant="ghost" asChild className="mb-8 -ml-4">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to all posts
            </Link>
          </Button>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{post.title}</h1>

          <div className="mt-4 flex items-center space-x-2 text-gray-500">
            <time dateTime="2024-06-12">{post.date}</time>
            <span>•</span>
            <span>{post.author}</span>
          </div>

          <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-lg">
            <Image 
              src={post.image || "/placeholder.svg"} 
              alt={post.title} 
              fill 
              className="object-contain object-left" 
              priority 
            />
          </div>

          <div
            className="prose prose-gray max-w-none pt-10 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
{/* 
          <Separator className="my-10" /> */}

          {/* <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-bold">Share this post</h3>
            <div className="flex space-x-4">
              <Button variant="outline" size="sm">
                Twitter
              </Button>
              <Button variant="outline" size="sm">
                Facebook
              </Button>
              <Button variant="outline" size="sm">
                LinkedIn
              </Button>
            </div>
          </div> */}
        </article>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2024 My Personal Blog. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Twitter
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              GitHub
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              LinkedIn
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}