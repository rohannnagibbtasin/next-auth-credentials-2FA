"use client";
import React, { useCallback, useEffect, useState } from 'react'
import { CardWrapper } from './card-wrapper';
import { BeatLoader } from 'react-spinners'
import { useSearchParams } from 'next/navigation';
import { newVerfication } from '@/actions/new-verfication';
import { FormSuccess } from '../form-success';
import { FormError } from '../form-error';

export const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>()
    const [success, setSucess] = useState<string | undefined>()

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const onSubmit = useCallback(()=>{

        if(success || error) return;

        if(!token){
            setError('Missing Token');
            return ;
        }
        newVerfication(token)
            .then((data)=>{
                setSucess(data.success)
                setError(data.error)
            })
            .catch(()=>[
                setError("Something went wrong")
            ])
    },[token])
    useEffect(()=>{
        onSubmit()
    },[onSubmit])

    return (
        <CardWrapper
            headerLabel='Conriming your verifcation'
            backButtonHref='/auth/login'
            backButtonLabel='Back to Login'
        >
            <div className='flex items-center w-full justify-center'>
                {!success && !error &&(
                    <BeatLoader />
                )}
                <FormSuccess message={success} />
                <FormError message={error} />
            </div>
        </CardWrapper>
    )
}


