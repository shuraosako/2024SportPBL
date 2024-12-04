import Image from "next/image";
import Link from 'next/link'

export default function Homepage() {
  return (
    
    <>
    <header>
        <div className="logo">SportsPBL</div>
        <div className="header-right">
          <ul>
            <li><Link href="/login">LOGIN</Link></li>
            <li><Link href="http://localhost:3000">TOP</Link></li>
            <li><a href="#">Settings</a></li>
          </ul>
        </div>
      </header>
    

    
    <div className="header-underline"></div>
    <div className="label-under">
    <div className="top-min">
      <Image 
          src="/images/baseball_ground.jpg" 
          alt="baseball_stadium"
          className="stadium-image"
          layout = "responsive"
          width= {1300}
          height={200} 
        />
    </div>
        <div className="ground-underline"></div>
        <div className="fit-ex"> 
        <div className="ex1">
         <p className="title1">Information</p>
         <p className="text1">Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
 sed do eiusmod tempor incididunt ut labore et dolore magna
 aliqua. Ut enim ad minim veniam, quis nostrud exercitation
 ullamco laboris nisi ut aliquip ex ea commodo consequat.
 Duis aute irure dolor in reprehenderit in voluptate velit esse
 cillum dolore eu fugiat nulla pariatur. Excepteur sint 
occaecat cupidatat non proident, sunt in culpa qui officia
 deserunt mollit anim id est laborum.</p>
         </div>
        <div className="top-fit">
      <Image 
          src="/images/fit.jpg" 
          alt="fit"
          layout = "responsive"
          width= {600}
          height={600} 
        />
        </div>
      </div>
      <div className="ground-underline"></div>
      <div className="rap-ex">
      <div className="rap-fit">
      <Image 
          src="/images/rapsodo.jpg" 
          alt="rap"
          layout = "responsive"
          width= {600}
          height={600} 
        />
      </div>
      <div className="ex2">
         <p className="title2">Information</p>
         <p className="text2">Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
 sed do eiusmod tempor incididunt ut labore et dolore magna
 aliqua. Ut enim ad minim veniam, quis nostrud exercitation
 ullamco laboris nisi ut aliquip ex ea commodo consequat.
 Duis aute irure dolor in reprehenderit in voluptate velit esse
 cillum dolore eu fugiat nulla pariatur. Excepteur sint 
occaecat cupidatat non proident, sunt in culpa qui officia
 deserunt mollit anim id est laborum.</p>
         </div>
      </div>
      </div>
      <div className="ground-underline"></div>
      <div className="last">
        <li><Link href="/"></Link></li>
        <div className="last-line">

        </div>
      
      </div>
      

      </>
    

    
  );
}