from setuptools import setup, find_packages

setup(
    name="ml-service",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "textblob",
        "vaderSentiment",
        "numpy",
        "pandas",
        "scikit-learn",
        "python-multipart",
        "pydantic",
    ],
    python_requires=">=3.8",
) 