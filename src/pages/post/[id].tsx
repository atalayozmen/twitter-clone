import { User } from "@clerk/nextjs/dist/server";
import { Post } from "@prisma/client";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  type NextPage,
} from "next";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

import Image from "next/image";
import { useRouter } from "next/router";
import { LoadingPage } from "~/components/loading";
import { api } from "~/utils/api";

interface Data {
  post: Post;
  author: User;
}

const SinglePostView: NextPage = () => {
  const id = useRouter().query.id as string;
  const { data, isLoading } = api.posts.getSinglePost.useQuery({
    postId: id,
  });

  if (!data) {
    return <div>Post not found</div>;
  }

  return (
    <div className="flex border-b border-slate-400 p-8" key={data.post.id}>
      <div>
        <button>
          <Image
            className="rounded-full"
            src={data.author.profileImageUrl}
            alt={"Image couldn't be found"}
            width={56}
            height={56}
          />
        </button>
      </div>
      <div className="flex flex-col text-slate-300">
        <div>{data.author.username}</div>
        <div>{data.post.content}</div>
      </div>
    </div>
  );
};

export default SinglePostView;
